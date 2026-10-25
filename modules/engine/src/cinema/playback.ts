import { queueLimits, syncLimits, type LoadReason, type PlaybackPhase, type PlaybackSnapshot, type QueueItem } from '@cinemate/protocol';

// The room's one playback record (spec §5.2), and its moves as pure functions: each takes the state
// and returns the next one. Times are server times in ms; positions are seconds.
export interface PlaybackState {
  readonly phase: PlaybackPhase;
  readonly item: QueueItem | null;
  readonly position: number;
  readonly at: number;
  readonly resume: boolean;
  readonly reason: LoadReason | null;
  readonly waitSince: number | null;
  readonly excused: readonly string[];
  // Who this wait has already been blamed on (D11), so each counts once.
  readonly blamed: readonly string[];
  readonly countdown: boolean;
  readonly upNextAt: number | null;
  readonly upNextHeld: boolean;
}

export const emptyPlayback: PlaybackState = {
  phase: 'empty',
  item: null,
  position: 0,
  at: 0,
  resume: false,
  reason: null,
  waitSince: null,
  excused: [],
  blamed: [],
  countdown: false,
  upNextAt: null,
  upNextHeld: false,
};

const settled = { resume: false, reason: null, waitSince: null, blamed: [], countdown: false, upNextAt: null, upNextHeld: false } as const;

// Where the video should be at `now` (spec §5.2). Before a start's moment it waits at `position`.
export const expectedPosition = (state: PlaybackState, now: number): number =>
  state.phase === 'playing' && now > state.at ? state.position + (now - state.at) / 1000 : state.position;

const clampPosition = (state: PlaybackState, position: number): number => Math.max(0, Math.min(position, state.item?.duration ?? queueLimits.maxSeconds));

// Everyone gets `item` ready at `position` (spec §5.3). A new video starts with nobody excused.
export const load = (state: PlaybackState, item: QueueItem, position: number, resume: boolean, reason: LoadReason, now: number): PlaybackState => ({
  ...state,
  ...settled,
  phase: 'loading',
  item,
  position,
  at: now,
  resume,
  reason,
  waitSince: now,
  excused: reason === 'start' ? [] : state.excused,
});

// Everyone is ready: play from a moment ahead (counting down for a new video or after a wait), or
// stay paused.
export const begin = (state: PlaybackState, now: number): PlaybackState => {
  if (!state.resume) return { ...state, ...settled, phase: 'paused', at: now };

  const countdown = state.reason === 'start' || state.reason === 'catchUp';

  return { ...state, ...settled, phase: 'playing', at: now + (countdown ? syncLimits.countdownMs : syncLimits.quickStartMs), countdown };
};

export const pause = (state: PlaybackState, now: number): PlaybackState => {
  if (state.phase === 'loading') return { ...state, resume: false };

  if (state.phase !== 'playing') return state;

  return { ...state, ...settled, phase: 'paused', position: expectedPosition(state, now), at: now };
};

export const resume = (state: PlaybackState, now: number): PlaybackState => {
  if (state.phase === 'loading') return { ...state, resume: true };

  return state.phase === 'paused' && state.item ? load(state, state.item, state.position, true, 'resume', now) : state;
};

export const isOnScreen = (state: PlaybackState): boolean => state.phase === 'loading' || state.phase === 'playing' || state.phase === 'paused';

// A seek keeps playing if it was playing, and stays paused if it was paused.
export const seek = (state: PlaybackState, position: number, now: number): PlaybackState => {
  if (!state.item || !isOnScreen(state)) return state;

  const playing = state.phase === 'playing' || (state.phase === 'loading' && state.resume);

  return load(state, state.item, clampPosition(state, position), playing, 'seek', now);
};

// Someone fell out of step: everyone stops where the video should be now, and waits for them.
export const catchUp = (state: PlaybackState, now: number): PlaybackState =>
  state.item ? load(state, state.item, expectedPosition(state, now), true, 'catchUp', now) : state;

export const upNext = (state: PlaybackState, now: number): PlaybackState => ({ ...state, ...settled, phase: 'upNext', upNextAt: now + syncLimits.upNextMs });

export const ended = (state: PlaybackState): PlaybackState => ({ ...state, ...settled, phase: 'ended', excused: [] });

export const empty = (): PlaybackState => emptyPlayback;

export const holdUpNext = (state: PlaybackState, held: boolean, now: number): PlaybackState => {
  if (state.phase !== 'upNext') return state;

  // Letting go gives everyone the full 5 seconds again.
  return held ? { ...state, upNextHeld: true } : { ...state, upNextHeld: false, upNextAt: now + syncLimits.upNextMs };
};

export const excuse = (state: PlaybackState, ids: readonly string[]): PlaybackState => ({ ...state, excused: [...new Set([...state.excused, ...ids])] });

export const admit = (state: PlaybackState, id: string): PlaybackState => ({ ...state, excused: state.excused.filter((other) => other !== id) });

export const blame = (state: PlaybackState, ids: readonly string[]): PlaybackState => ({ ...state, blamed: [...state.blamed, ...ids] });

export const forget = (state: PlaybackState, id: string): PlaybackState => ({
  ...state,
  excused: state.excused.filter((other) => other !== id),
  blamed: state.blamed.filter((other) => other !== id),
});

export const describeItem = (state: PlaybackState, item: QueueItem): PlaybackState => (state.item?.id === item.id ? { ...state, item } : state);

export const toPlaybackSnapshot = (state: PlaybackState, waitingFor: string[]): PlaybackSnapshot => ({
  phase: state.phase,
  item: state.item,
  position: state.position,
  at: state.at,
  resume: state.resume,
  reason: state.reason,
  waitSince: state.waitSince,
  waitingFor,
  excused: [...state.excused],
  countdown: state.countdown,
  upNextAt: state.upNextAt,
  upNextHeld: state.upNextHeld,
});
