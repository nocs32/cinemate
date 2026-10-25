import { syncLimits, type PlayerState } from '@cinemate/protocol';

// What a browser last said its player was doing (spec §5.4), with `sampledAt` on the room clock.
export interface ViewerReport {
  itemId: string | null;
  state: PlayerState;
  position: number;
  sampledAt: number;
}

export interface Viewer {
  readonly id: string;
  entered: boolean;
  connected: boolean;
  report: ViewerReport | null;
  reportedAt: number;
  // How far off their last report was while playing, in ms (negative: behind), or null.
  offsetMs: number | null;
  // Reports in a row that were off: buffering, stuck, paused, or too far from the room.
  badReports: number;
  // Times they kept the room waiting tonight (D11).
  slowpokes: number;
  // While someone shares: the frames a second their screen shows (D31).
  watchFps: number | null;
}

// Everyone's player, as the cinema judges it. People are added on joining and removed on leaving.
export class CinemaViewers {
  readonly #viewers = new Map<string, Viewer>();

  get all(): Viewer[] {
    return [...this.#viewers.values()];
  }

  find(id: string): Viewer | undefined {
    return this.#viewers.get(id);
  }

  join(id: string, entered: boolean): void {
    this.#viewers.set(id, { id, entered, connected: true, report: null, reportedAt: 0, offsetMs: null, badReports: 0, slowpokes: 0, watchFps: null });
  }

  leave(id: string): void {
    this.#viewers.delete(id);
  }

  enter(id: string): void {
    const viewer = this.#viewers.get(id);

    if (viewer) viewer.entered = true;
  }

  connect(id: string, connected: boolean): void {
    const viewer = this.#viewers.get(id);

    if (viewer) viewer.connected = connected;
  }

  record(id: string, report: ViewerReport, now: number, offsetMs: number | null, bad: boolean): void {
    const viewer = this.#viewers.get(id);

    if (!viewer) return;

    viewer.report = report;
    viewer.reportedAt = now;
    viewer.offsetMs = offsetMs;
    viewer.badReports = bad ? viewer.badReports + 1 : 0;
  }

  recordWatch(id: string, fps: number): void {
    const viewer = this.#viewers.get(id);

    if (viewer) viewer.watchFps = Math.round(fps);
  }

  // The share ended: nobody is watching one any more.
  clearWatch(): void {
    this.#viewers.forEach((viewer) => {
      viewer.watchFps = null;
    });
  }

  blame(id: string): void {
    const viewer = this.#viewers.get(id);

    if (viewer) viewer.slowpokes += 1;
  }

  // Past the join card and connected: the people the room plays for, and waits for.
  watching(): Viewer[] {
    return this.all.filter((viewer) => viewer.entered && viewer.connected);
  }

  isFresh(viewer: Viewer, now: number): boolean {
    return viewer.report !== null && now - viewer.reportedAt <= syncLimits.staleReportMs;
  }
}
