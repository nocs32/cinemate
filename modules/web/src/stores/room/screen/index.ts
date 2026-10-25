import type { MediaKind, PlaybackSnapshot, QueueItem } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../../services';
import type { Translate } from '../../locale';
import type { RoomClockStore } from '../clock';
import type { RoomPresenceStore } from '../presence';
import { titleOf, type RoomQueueStore } from '../queue';
import type { CinemaSend } from '../types';
import { RoomScreenWaitingStore } from './waiting';

export interface RoomScreenDeps {
  t: Translate;
  clock: RoomClockStore;
  presence: RoomPresenceStore;
  queue: RoomQueueStore;
  send: CinemaSend;
  repeat: Schedule;
  // Someone is sharing live (spec §14): the live screen covers the player, and nothing is drawn over it.
  isLive: () => boolean;
}

// What's drawn over the screen: nothing, the empty room, the end of the queue, "Up next", the
// waiting slate, the film leader counting down, or the big play button while it's paused.
export type ScreenOverlay = 'none' | 'empty' | 'ended' | 'upNext' | 'waiting' | 'leader' | 'paused' | 'live';

const tickMs = 200;

const emptyPlayback: PlaybackSnapshot = {
  phase: 'empty',
  item: null,
  position: 0,
  at: 0,
  resume: false,
  reason: null,
  waitSince: null,
  waitingFor: [],
  excused: [],
  countdown: false,
  upNextAt: null,
  upNextHeld: false,
};

// The room's playback as the screen shows it (spec §9). Times that move (the countdown, how long the
// room has waited) read the room clock on a ticker that runs only while something moves.
export class RoomScreenStore {
  playback: PlaybackSnapshot = emptyPlayback;
  tick = 0;
  readonly waiting: RoomScreenWaitingStore;
  readonly #deps: RoomScreenDeps;
  #stopTicker: (() => void) | null = null;

  constructor(deps: RoomScreenDeps) {
    this.#deps = deps;
    this.waiting = new RoomScreenWaitingStore({ ...deps, screen: this });
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get item(): QueueItem | null {
    return this.playback.item;
  }

  get title(): string {
    return this.item ? titleOf(this.item, this.#deps.t) : '';
  }

  get kind(): MediaKind | null {
    return this.item?.source.kind ?? null;
  }

  get isYoutube(): boolean {
    return this.kind === 'youtube';
  }

  get thumbnail(): string | null {
    return this.item?.thumbnail ?? null;
  }

  get metaLabel(): string {
    const { item } = this;

    if (!item) return '';

    const name = this.#deps.presence.find(item.addedBy.id)?.name ?? item.addedBy.name;

    return this.#deps.t('now.meta', { kind: this.#deps.t(`now.kind.${item.source.kind}`), name });
  }

  // The room clock, re-read on every tick.
  get serverNow(): number {
    void this.tick;

    return this.#deps.clock.serverNow();
  }

  // Where the video should be now (spec §5.2).
  get expected(): number {
    const { phase, position, at } = this.playback;
    const now = this.serverNow;

    return phase === 'playing' && now > at ? position + (now - at) / 1000 : position;
  }

  get isPlaying(): boolean {
    const { phase, resume } = this.playback;

    return phase === 'playing' || (phase === 'loading' && resume);
  }

  get hasVideo(): boolean {
    const { phase } = this.playback;

    return phase === 'loading' || phase === 'playing' || phase === 'paused';
  }

  get isCountingDown(): boolean {
    const { phase, countdown, at } = this.playback;

    return phase === 'playing' && countdown && this.serverNow < at;
  }

  get isLive(): boolean {
    return this.#deps.isLive();
  }

  // The queue's video is what's on screen: there is one, and no live share covers it.
  get showsFilm(): boolean {
    return this.hasVideo && !this.isLive;
  }

  get overlay(): ScreenOverlay {
    const { phase } = this.playback;

    if (this.isLive) return 'live';

    if (phase === 'empty' || phase === 'ended' || phase === 'upNext') return phase;

    if (this.waiting.isShown) return 'waiting';

    if (this.isCountingDown) return 'leader';

    return phase === 'paused' ? 'paused' : 'none';
  }

  get leaderNumber(): string {
    return String(Math.min(3, Math.max(1, Math.ceil((this.playback.at - this.serverNow) / 1000))));
  }

  get leaderLabel(): string {
    return this.#deps.t('screen.leader', { count: Math.max(1, this.#deps.presence.watching.length) });
  }

  get upNextTitle(): string {
    const { next } = this.#deps.queue;

    return next ? titleOf(next, this.#deps.t) : '';
  }

  get upNextThumbnail(): string | null {
    return this.#deps.queue.next?.thumbnail ?? null;
  }

  get isUpNextHeld(): boolean {
    return this.playback.upNextHeld;
  }

  get upNextLabel(): string {
    const { t } = this.#deps;
    const seconds = Math.max(0, Math.ceil(((this.playback.upNextAt ?? 0) - this.serverNow) / 1000));

    return this.isUpNextHeld ? t('screen.upNext.held') : t('screen.upNext.in', { count: seconds });
  }

  // The room went on without me, or I came in mid-video: I'm catching up on my own.
  get isCatchingUp(): boolean {
    return this.hasVideo && this.playback.excused.includes(this.#deps.presence.meId);
  }

  receive(playback: PlaybackSnapshot): void {
    this.playback = playback;
    this.#runTicker(playback.phase === 'loading' || playback.phase === 'playing' || playback.phase === 'upNext');
  }

  nudge(): void {
    this.tick += 1;
  }

  toggleUpNext(): void {
    this.#deps.send('holdUpNext', { held: !this.isUpNextHeld });
  }

  // "Play next now": skips to the next video for everyone (or starts it at once from "Up next").
  skip(): void {
    this.#deps.send('skip', {});
  }

  dispose(): void {
    this.#runTicker(false);
  }

  #runTicker(on: boolean): void {
    if (on && !this.#stopTicker) this.#stopTicker = this.#deps.repeat(this.nudge, tickMs);

    if (!on && this.#stopTicker) {
      this.#stopTicker();
      this.#stopTicker = null;
    }
  }
}
