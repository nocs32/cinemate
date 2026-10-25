import { syncLimits, type ViewerStatus } from '@cinemate/protocol';
import { expectedPosition, type PlaybackState } from './playback.js';
import type { Viewer, ViewerReport } from './viewers.js';

// How a report compares with the room (spec §5.4): how far off it is while playing, and whether
// it counts against them.
export interface Verdict {
  offsetMs: number | null;
  bad: boolean;
}

const notPlaying: Verdict = { offsetMs: null, bad: false };

const inGrace = (state: PlaybackState, at: number): boolean => at < state.at + syncLimits.startupGraceMs;

export const judgeReport = (state: PlaybackState, report: ViewerReport): Verdict => {
  if (state.phase !== 'playing' || !state.item || inGrace(state, report.sampledAt)) return notPlaying;

  if (report.itemId !== state.item.id) return { offsetMs: null, bad: true };

  if (report.state === 'ended') return notPlaying;

  if (report.state !== 'playing') return { offsetMs: null, bad: true };

  const offsetMs = Math.round((report.position - expectedPosition(state, report.sampledAt)) * 1000);

  return { offsetMs, bad: Math.abs(offsetMs) > syncLimits.toleranceMs };
};

// Ready to start: on this video, paused or ready, near the position the room waits at.
export const isReady = (state: PlaybackState, viewer: Viewer): boolean => {
  const { report } = viewer;

  if (!report || !state.item || report.itemId !== state.item.id) return false;

  return (report.state === 'ready' || report.state === 'paused') && Math.abs(report.position - state.position) <= syncLimits.readySlackSeconds;
};

const fromPlayer = (report: ViewerReport | null): ViewerStatus => {
  if (report?.state === 'buffering' || report?.state === 'stuck' || report?.state === 'paused') return report.state;

  return 'loading';
};

const whilePlaying = (state: PlaybackState, viewer: Viewer, now: number): ViewerStatus => {
  if (now < state.at + syncLimits.startupGraceMs) return 'inSync';

  const { report, offsetMs } = viewer;

  if (report?.state === 'playing' && offsetMs !== null && Math.abs(offsetMs) > syncLimits.toleranceMs) return offsetMs < 0 ? 'behind' : 'ahead';

  return report?.state === 'playing' || report?.state === 'ended' ? 'inSync' : fromPlayer(report);
};

// Someone's status as the room shows it (spec §7).
export const statusOf = (state: PlaybackState, viewer: Viewer, now: number): ViewerStatus => {
  if (!viewer.connected) return 'reconnecting';

  if (!viewer.entered) return 'joining';

  if (state.excused.includes(viewer.id) && (state.phase === 'loading' || state.phase === 'playing')) return 'catchingUp';

  if (state.phase === 'loading') return isReady(state, viewer) ? 'ready' : fromPlayer(viewer.report);

  return state.phase === 'playing' ? whilePlaying(state, viewer, now) : 'inSync';
};

// The offset shown with "behind" and "ahead", rounded to 100 ms so the room's view doesn't change
// with every report.
export const shownOffset = (status: ViewerStatus, viewer: Viewer): number | null =>
  (status === 'behind' || status === 'ahead') && viewer.offsetMs !== null ? Math.round(viewer.offsetMs / 100) * 100 : null;
