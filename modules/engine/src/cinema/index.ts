import { syncLimits, type FeedEvent, type MediaErrorCode, type MediaSource, type PlaybackSnapshot, type QueueAuthor, type QueueItem, type ViewerStatus } from '@cinemate/protocol';
import { isReady, judgeReport, shownOffset, statusOf } from './judge.js';
import * as playback from './playback.js';
import { CinemaQueue, type QueueItemDetails } from './queue.js';
import { CinemaRuleError } from './rule-error.js';
import { CinemaViewers, type Viewer, type ViewerReport } from './viewers.js';

export { CinemaRuleError } from './rule-error.js';
export type { QueueItemDetails } from './queue.js';
export type { ViewerReport } from './viewers.js';
export { expectedPosition, type PlaybackState } from './playback.js';

export interface CinemaDeps {
  createId: () => string;
  // A member's name, for feed lines that name others ("went on without Dima").
  nameOf: (id: string) => string;
}

// Something that becomes a feed line: who did it (or who the room waited for), and what.
export interface CinemaNotice {
  by: string;
  event: FeedEvent;
}

// What the room shows about someone, besides their name and colour.
export interface CinemaMemberState {
  entered: boolean;
  status: ViewerStatus;
  offsetMs: number | null;
  slowpokes: number;
}

export interface CinemaView {
  playback: PlaybackSnapshot;
  queue: QueueItem[];
  history: QueueItem[];
}

// One room's cinema (spec §5, §6): the queue, everyone's player, and the one playback record, with
// every rule for keeping them together. Pure: times come in as `now`, the owner calls `tick` a few
// times a second, and feed lines go out through `drainNotices`. The server and the demo room both
// run it.
export class Cinema {
  readonly queue: CinemaQueue;
  readonly viewers = new CinemaViewers();
  playback: playback.PlaybackState = playback.emptyPlayback;
  #notices: CinemaNotice[] = [];
  readonly #deps: CinemaDeps;

  constructor(deps: CinemaDeps) {
    this.#deps = deps;
    this.queue = new CinemaQueue(deps);
  }

  join(id: string, entered: boolean, now: number): void {
    this.viewers.join(id, entered);

    if (entered) this.#welcome(id);

    this.tick(now);
  }

  enter(id: string, now: number): void {
    if (this.viewers.find(id)?.entered !== false) return;

    this.viewers.enter(id);
    this.#welcome(id);
    this.tick(now);
  }

  leave(id: string, now: number): void {
    this.viewers.leave(id);
    this.playback = playback.forget(this.playback, id);
    this.tick(now);
  }

  connect(id: string, connected: boolean, now: number): void {
    this.viewers.connect(id, connected);
    this.tick(now);
  }

  add(by: QueueAuthor, source: MediaSource, title: string | null, now: number): QueueItem {
    const item = this.queue.add(source, title, by);

    this.#queued(by.id, item, now);

    return item;
  }

  replay(by: QueueAuthor, itemId: string, now: number): QueueItem {
    const item = this.queue.replay(itemId, by);

    this.#queued(by.id, item, now);

    return item;
  }

  // Out of the queue. The video on screen too: then the next one starts for everyone (playing if
  // the room was), and the removed one doesn't go into tonight's history.
  remove(byId: string, itemId: string, now: number): void {
    const current = this.playback.item;

    if (current?.id === itemId && playback.isOnScreen(this.playback)) {
      const { isPlaying } = this;

      this.#notice(byId, { type: 'removed', title: current.title ?? '' });
      this.#startNext(now, isPlaying);

      return;
    }

    const item = this.queue.remove(itemId);

    this.#notice(byId, { type: 'removed', title: item.title ?? '' });
  }

  get isPlaying(): boolean {
    const { phase, resume } = this.playback;

    return phase === 'playing' || (phase === 'loading' && resume);
  }

  move(itemId: string, toIndex: number): void {
    this.queue.move(itemId, toIndex);
  }

  describe(itemId: string, details: QueueItemDetails): void {
    const item = this.playback.item?.id === itemId ? this.playback.item : this.queue.find(itemId);

    if (item) this.playback = playback.describeItem(this.playback, this.queue.describe(item, details));
  }

  play(byId: string, now: number): void {
    if (this.playback.phase === 'upNext') return this.#startNext(now);

    this.#needScreen();
    this.playback = playback.resume(this.playback, now);
    this.#notice(byId, { type: 'played', at: this.playback.position });
  }

  pause(byId: string, now: number): void {
    this.#needScreen();
    this.playback = playback.pause(this.playback, now);
    this.#notice(byId, { type: 'paused', at: this.playback.position });
  }

  seek(byId: string, position: number, now: number): void {
    this.#needScreen();
    this.playback = playback.seek(this.playback, position, now);
    this.#notice(byId, { type: 'seeked', at: this.playback.position });
  }

  skip(byId: string, now: number): void {
    if (this.playback.phase === 'upNext') return this.#startNext(now);

    const item = this.#needScreen();

    this.queue.played(item);
    this.#notice(byId, { type: 'skipped', title: item.title ?? '' });
    this.#startNext(now);
  }

  // After 20 s of waiting, everyone else may carry on (D10); the slow ones catch up on their own.
  goOnWithout(byId: string, now: number): void {
    const { phase, waitSince } = this.playback;

    if (phase !== 'loading' || waitSince === null) throw new CinemaRuleError('NOTHING_PLAYING');

    if (now - waitSince < syncLimits.goOnAfterMs) throw new CinemaRuleError('TOO_SOON');

    const pending = this.#pending();

    if (pending.length === 0) return;

    this.playback = playback.excuse(this.playback, pending);
    this.#notice(byId, { type: 'wentOnWithout', names: pending.map(this.#deps.nameOf) });
    this.tick(now);
  }

  holdUpNext(held: boolean, now: number): void {
    this.playback = playback.holdUpNext(this.playback, held, now);
  }

  report(id: string, report: ViewerReport, now: number): void {
    if (!this.viewers.find(id)) return;

    // A clock that's way off can't move the room: such a report counts as sampled now.
    const sampledAt = Math.abs(report.sampledAt - now) > syncLimits.staleReportMs ? now : report.sampledAt;
    const clean = { ...report, sampledAt };
    const verdict = judgeReport(this.playback, clean);

    this.viewers.record(id, clean, now, verdict.offsetMs, verdict.bad);
    this.tick(now);
  }

  // The video on screen can't be played: say so and go on to the next one.
  failed(byId: string, itemId: string, code: MediaErrorCode, now: number): void {
    const { item } = this.playback;

    if (!item || item.id !== itemId || !playback.isOnScreen(this.playback)) return;

    this.#notice(byId, { type: 'failed', title: item.title ?? '', code });
    this.#startNext(now);
  }

  // The moves time makes: starting once everyone is ready, waiting for whoever falls out of step,
  // the end of a video, and the "Up next" card running out.
  tick(now: number): void {
    const { phase, upNextAt, upNextHeld } = this.playback;

    if (phase === 'loading') this.#settle(now);
    else if (phase === 'playing') this.#watch(now);
    else if (phase === 'upNext' && !upNextHeld && upNextAt !== null && now >= upNextAt) this.#startNext(now);
  }

  drainNotices(): CinemaNotice[] {
    const notices = this.#notices;

    this.#notices = [];

    return notices;
  }

  member(id: string, now: number): CinemaMemberState | null {
    const viewer = this.viewers.find(id);

    if (!viewer) return null;

    const status = statusOf(this.playback, viewer, now);

    return { entered: viewer.entered, status, offsetMs: shownOffset(status, viewer), slowpokes: viewer.slowpokes };
  }

  view(): CinemaView {
    const waitingFor = this.playback.phase === 'loading' ? this.#pending() : [];

    return { playback: playback.toPlaybackSnapshot(this.playback, waitingFor), queue: this.queue.items, history: this.queue.history };
  }

  // Someone who comes in mid-video catches up on their own: the room doesn't wait for newcomers (§5.5).
  #welcome(id: string): void {
    if (this.playback.phase === 'playing' || this.playback.phase === 'loading') this.playback = playback.excuse(this.playback, [id]);
  }

  #queued(byId: string, item: QueueItem, now: number): void {
    this.#notice(byId, { type: 'added', title: item.title ?? '' });

    // A link pasted into a room with nothing on loads paused: someone presses play for everyone.
    if (this.playback.phase === 'empty' || this.playback.phase === 'ended') this.#startNext(now, false);
  }

  #needScreen(): QueueItem {
    const { item } = this.playback;

    if (!item || !playback.isOnScreen(this.playback)) throw new CinemaRuleError('NOTHING_PLAYING');

    return item;
  }

  // Who the room still waits for: everyone watching who isn't ready and wasn't excused.
  #pending(): string[] {
    const counted = this.viewers.watching().filter((viewer) => !this.playback.excused.includes(viewer.id));

    return counted.filter((viewer) => !isReady(this.playback, viewer)).map((viewer) => viewer.id);
  }

  #settle(now: number): void {
    const pending = this.#pending();
    const { waitSince, blamed } = this.playback;
    const late = pending.filter((id) => !blamed.includes(id));

    if (waitSince !== null && now - waitSince >= syncLimits.slowpokeAfterMs && late.length > 0) {
      late.forEach((id) => this.#blame(id, now));
      this.playback = playback.blame(this.playback, late);
    }

    if (pending.length === 0) this.playback = playback.begin(this.playback, now);
  }

  #blame(id: string, now: number): void {
    const viewer = this.viewers.find(id);

    this.viewers.blame(id);

    if (viewer) this.#notice(id, { type: 'waiting', status: statusOf(this.playback, viewer, now) });
  }

  #watch(now: number): void {
    if (now < this.playback.at + syncLimits.startupGraceMs) return;

    if (this.#isOver(now)) return this.#finish(now);

    const fresh = this.viewers.watching().filter((viewer) => this.viewers.isFresh(viewer, now));
    const excused = (viewer: Viewer): boolean => this.playback.excused.includes(viewer.id);

    fresh.filter((viewer) => excused(viewer) && this.#inStep(viewer)).forEach((viewer) => {
      this.playback = playback.admit(this.playback, viewer.id);
    });

    if (fresh.some((viewer) => !excused(viewer) && viewer.badReports >= syncLimits.badReportsToWait)) this.playback = playback.catchUp(this.playback, now);
  }

  #inStep(viewer: Viewer): boolean {
    return viewer.report?.state === 'playing' && viewer.badReports === 0 && viewer.offsetMs !== null;
  }

  #isOver(now: number): boolean {
    const { item, excused } = this.playback;

    if (!item) return false;

    if (item.duration !== null && playback.expectedPosition(this.playback, now) >= item.duration - 0.25) return true;

    return this.viewers.watching().some((viewer) => !excused.includes(viewer.id) && viewer.report?.itemId === item.id && viewer.report.state === 'ended');
  }

  #finish(now: number): void {
    if (this.playback.item) this.queue.played(this.playback.item);

    this.playback = this.queue.next ? playback.upNext(this.playback, now) : playback.ended(this.playback);
  }

  // The next video, playing once everyone has it (after "Up next", a skip, or one that failed), or
  // paused at its start (the first in a room with nothing on).
  #startNext(now: number, resume = true): void {
    const next = this.queue.takeNext();

    if (next) this.playback = playback.load(this.playback, next, next.source.start, resume, 'start', now);
    else this.playback = this.playback.item ? playback.ended(this.playback) : playback.empty();
  }

  #notice(by: string, event: FeedEvent): void {
    this.#notices = [...this.#notices, { by, event }];
  }
}
