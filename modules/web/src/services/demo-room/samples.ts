import { expectedPosition, type Cinema, type ViewerReport } from '@cinemate/engine';
import type { ViewerColor } from '@cinemate/protocol';
import type { DemoAction } from '../types';
import type { DemoDeps, DemoSampleMode } from './types';

export interface DemoSampleProfile {
  name: string;
  color: ViewerColor;
}

// Who sits down in the demo room, in order.
export const demoProfiles: readonly DemoSampleProfile[] = [
  { name: 'Dima', color: 'sky' },
  { name: 'Oleh', color: 'coral' },
  { name: 'Marta', color: 'violet' },
  { name: 'Taras', color: 'pink' },
  { name: 'Sofia', color: 'lime' },
  { name: 'Ivan', color: 'orange' },
];

interface DemoSample {
  id: string;
  mode: DemoSampleMode;
  until: number;
  // How long their pretend player takes to get a video ready.
  loadMs: number;
}

// Each demo button: which sample it picks, what happens to their player, for how long, and what
// they say about it a moment later.
const cues: Partial<Record<DemoAction, { index: number; mode: DemoSampleMode; ms: number; line: string }>> = {
  buffer: { index: 0, mode: 'buffering', ms: 8000, line: 'sorry, the router again 🙃' },
  ad: { index: 1, mode: 'ad', ms: 40_000, line: 'та що ж ця реклама 😩' },
  lag: { index: 2, mode: 'lagging', ms: 3000, line: 'my laptop froze for a sec' },
};

// The sample viewers' pretend players: they report to the cinema twice a second like real browsers,
// and buffer, sit through an ad or fall behind when a demo button says so.
export class DemoSamples {
  #samples: DemoSample[] = [];
  readonly #deps: DemoDeps;

  constructor(deps: DemoDeps) {
    this.#deps = deps;
  }

  get ids(): string[] {
    return this.#samples.map((sample) => sample.id);
  }

  add(id: string): void {
    this.#samples = [...this.#samples, { id, mode: 'fine', until: 0, loadMs: 300 + this.#deps.random() * 600 }];
  }

  remove(id: string): void {
    this.#samples = this.#samples.filter((sample) => sample.id !== id);
  }

  // Puts a sample into trouble; returns who, and what they'll say about it.
  cue(action: DemoAction): { id: string; line: string } | null {
    const cue = cues[action];
    const sample = cue ? this.#samples[cue.index] : undefined;

    if (!cue || !sample) return null;

    sample.mode = cue.mode;
    sample.until = this.#deps.now() + cue.ms;

    return { id: sample.id, line: cue.line };
  }

  reportAll(cinema: Cinema): void {
    const now = this.#deps.now();

    this.#samples.forEach((sample) => {
      if (sample.mode !== 'fine' && now > sample.until) sample.mode = 'fine';

      cinema.report(sample.id, this.#report(sample, cinema, now), now);
    });
  }

  #report(sample: DemoSample, cinema: Cinema, now: number): ViewerReport {
    const { playback } = cinema;
    const base = { itemId: playback.item?.id ?? null, position: playback.position, sampledAt: now };

    if (playback.phase === 'loading') return { ...base, state: this.#loading(sample, now - (playback.waitSince ?? now)) };

    if (playback.phase === 'paused') return { ...base, state: 'paused' };

    if (playback.phase !== 'playing') return { ...base, state: 'idle' };

    if (now < playback.at) return { ...base, state: 'ready' };

    return this.#playing(sample, { ...base, position: expectedPosition(playback, now) });
  }

  #loading(sample: DemoSample, waitedMs: number): ViewerReport['state'] {
    if (sample.mode === 'buffering') return 'buffering';

    if (sample.mode === 'ad') return 'stuck';

    return waitedMs >= sample.loadMs ? 'ready' : 'loading';
  }

  #playing(sample: DemoSample, report: Omit<ViewerReport, 'state'>): ViewerReport {
    const jitter = (this.#deps.random() - 0.5) * 0.06;

    if (sample.mode === 'buffering') return { ...report, state: 'buffering' };

    if (sample.mode === 'ad') return { ...report, state: 'stuck' };

    return { ...report, state: 'playing', position: report.position + jitter - (sample.mode === 'lagging' ? 0.8 : 0) };
  }
}
