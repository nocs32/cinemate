import { syncLimits, type MediaErrorCode } from '@cinemate/protocol';
import { makeAutoObservable, observableRef, reaction } from 'mobx';
import type { PlayerUserAction, Schedule, ScreenPlayer, ScreenPlayerFactory, ScreenPlayerListeners } from '../../../services';
import type { RoomClockStore } from '../clock';
import type { CinemaSend } from '../types';
import type { RoomScreenStore } from '.';

export interface RoomScreenDriverDeps {
  screen: RoomScreenStore;
  clock: RoomClockStore;
  send: CinemaSend;
  schedule: Schedule;
  repeat: Schedule;
  now: () => number;
  createPlayer: ScreenPlayerFactory;
  // Past the join card: until then the player only gets ready, so nothing plays before the click.
  isWatching: () => boolean;
}

// Asked to be somewhere within this, a player counts as there.
const holdSlackSeconds = 0.25;
// The same seek isn't asked for again this soon (the player is still getting there).
const reseekMs = 2000;
// Catching up alone, a player aims this far ahead, for the moment starting takes.
const catchUpLeadSeconds = 0.15;
// After someone uses YouTube's own bar, the player is left alone this long, until the room answers.
const userActionMs = 1500;

// This browser's side of the sync (spec §5.3, §5.4): it turns the room's playback into commands for
// the screen's player (load, hold paused at the position, start at the agreed moment), and tells
// the room twice a second what the player really does. It never corrects the player on its own while
// it's counted in: the room waits instead (D7). Only when the room went on without it does it catch
// up alone. States: detached ⇄ attached (a player is on the page).
export class RoomScreenDriverStore {
  player: ScreenPlayer | null = null;
  // Bumped whenever the player says something changed, so the reaction looks again.
  version = 0;
  readonly listeners: ScreenPlayerListeners;
  readonly #deps: RoomScreenDriverDeps;
  #startAt: number | null = null;
  #cancelStart: (() => void) | null = null;
  #lastSeek = { position: -1, at: 0 };
  #userActedAt = 0;
  #stops: Array<() => void> = [];

  constructor(deps: RoomScreenDriverDeps) {
    this.#deps = deps;

    // Through arrows: the player calls these later, once the methods are bound to this store.
    this.listeners = {
      changed: () => this.bump(),
      userAction: (action) => this.userAction(action),
      failed: (code) => this.failed(code),
      described: (duration, title) => this.described(duration, title),
    };

    makeAutoObservable(this, { player: observableRef, listeners: false }, { autoBind: true });
  }

  get isAttached(): boolean {
    return this.player !== null;
  }

  // The browser stopped the player from starting by itself: one click on the page fixes it.
  get needsClick(): boolean {
    void this.version;

    return this.player?.needsClick() ?? false;
  }

  // The screen is on the page: a player goes into its element. The element stays the player's.
  mount(element: HTMLElement): void {
    if (!this.player) this.attach(this.#deps.createPlayer(element, this.listeners));
  }

  attach(player: ScreenPlayer): void {
    this.player = player;

    this.#stops = [
      reaction(() => [this.#deps.screen.playback, this.version, this.player, this.#deps.isWatching()] as const, this.apply, { fireImmediately: true }),
      this.#deps.repeat(this.report, syncLimits.statusIntervalMs),
    ];
  }

  detach(): void {
    this.#stops.forEach((stop) => stop());
    this.#stops = [];
    this.#cancel();
    this.player?.destroy();
    this.player = null;
  }

  bump(): void {
    this.version += 1;
  }

  // YouTube's own bar was used (D12): that's this person's move, for the whole room.
  userAction(action: PlayerUserAction): void {
    this.#userActedAt = this.#deps.now();

    if (action.type === 'seek') this.#deps.send('seek', { position: action.position });
    else this.#deps.send(action.type, {});
  }

  failed(code: MediaErrorCode): void {
    const itemId = this.player?.itemId;

    if (itemId) this.#deps.send('mediaError', { itemId, code });
  }

  described(duration: number, title: string | null): void {
    const itemId = this.player?.itemId;

    if (itemId) this.#deps.send('describe', { itemId, duration: Math.max(0, duration), title });
  }

  // Twice a second: what the player does, where, and when by the room clock.
  report(): void {
    const { player } = this;

    if (!player) return;

    this.#deps.send('status', { itemId: player.itemId, state: player.state(), position: Math.max(0, player.time()), sampledAt: this.#deps.clock.serverNow() });
  }

  // Unblocks a player the browser stopped from starting by itself (one click on the page).
  unblock(): void {
    this.player?.play();
  }

  apply(): void {
    const { player } = this;
    const { playback } = this.#deps.screen;
    const { item, phase } = playback;

    if (!player) return;

    if (!item || !this.#deps.screen.hasVideo) {
      this.#cancel();

      if (player.itemId !== null) player.stop();

      return;
    }

    if (player.itemId !== item.id) return this.#load();

    if (player.state() === 'loading' || player.state() === 'idle' || this.#deps.now() - this.#userActedAt < userActionMs) return;

    if (!this.#deps.isWatching()) this.#rest();
    else if (phase === 'playing') this.#play();
    else this.#hold(playback.position);
  }

  #load(): void {
    const { player } = this;
    const { item, position } = this.#deps.screen.playback;

    if (!player || !item) return;

    this.#cancel();
    player.load(item.id, item.source, this.#deps.screen.isCatchingUp ? this.#deps.screen.expected : position);
  }

  // Still on the join card: loaded and paused, wherever it is. Joining catches it up.
  #rest(): void {
    this.#cancel();

    if (this.player?.state() === 'playing') this.player.pause();
  }

  // Paused at `position`, buffered, ready for the room to start.
  #hold(position: number): void {
    const { player } = this;

    if (!player) return;

    this.#cancel();

    if (player.state() === 'playing' || player.state() === 'buffering') player.pause();

    if (Math.abs(player.time() - position) > holdSlackSeconds) this.#seek(position);
  }

  #play(): void {
    const { player } = this;
    const { at, position } = this.#deps.screen.playback;
    const startLocal = this.#deps.clock.toLocal(at);

    if (!player) return;

    if (this.#deps.now() < startLocal) {
      this.#hold(position);
      this.#scheduleStart(startLocal);

      return;
    }

    this.#cancel();

    if (this.#deps.screen.isCatchingUp) return this.#catchUp();

    if (player.state() === 'paused' || player.state() === 'ready') player.play();
  }

  // The room went on without this browser, or it came in mid-video: get to where the video should be
  // and play from there; the room counts it in again once it's in step.
  #catchUp(): void {
    const { player } = this;
    const target = this.#deps.screen.expected + catchUpLeadSeconds;

    if (!player) return;

    if (Math.abs(player.time() - target) > syncLimits.toleranceMs / 1000) this.#seek(target);

    if (player.state() !== 'playing') player.play();
  }

  #scheduleStart(startLocal: number): void {
    if (this.#startAt === startLocal) return;

    this.#cancel();
    this.#startAt = startLocal;
    this.#cancelStart = this.#deps.schedule(() => this.player?.play(), Math.max(0, startLocal - this.#deps.now()));
  }

  #seek(position: number): void {
    const now = this.#deps.now();

    if (Math.abs(this.#lastSeek.position - position) < holdSlackSeconds && now - this.#lastSeek.at < reseekMs) return;

    this.#lastSeek = { position, at: now };
    this.player?.seek(position);
  }

  #cancel(): void {
    this.#cancelStart?.();
    this.#cancelStart = null;
    this.#startAt = null;
  }
}
