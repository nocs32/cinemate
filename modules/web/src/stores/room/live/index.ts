import { liveLimits, type ShareSnapshot } from '@cinemate/protocol';
import { makeAutoObservable, observableRef, reaction } from 'mobx';
import type { LiveMediaService, LiveScreen, Schedule, VolumePreference } from '../../../services';
import type { Translate } from '../../locale';
import type { RoomPresenceStore } from '../presence';
import type { CinemaSend } from '../types';
import { RoomLiveSharerStore } from './sharer';

export interface RoomLiveDeps {
  t: Translate;
  liveMedia: LiveMediaService;
  presence: RoomPresenceStore;
  send: CinemaSend;
  repeat: Schedule;
  // Your volume (D8): the same as for videos.
  volume: () => VolumePreference;
}

// The room's live share as everyone sees it (spec §14.1): off, or on with who's sharing. While it's on,
// the live screen over the player shows it (the sharer sees their own capture), and every 2 s this
// browser tells the room how many frames a second it gets (D31). Your own side of sharing is the sharer.
export class RoomLiveStore {
  share: ShareSnapshot | null = null;
  screen: LiveScreen | null = null;
  readonly sharer: RoomLiveSharerStore;
  // Bumped whenever the live screen says something changed.
  version = 0;
  readonly #deps: RoomLiveDeps;
  #stops: Array<() => void> = [];

  constructor(deps: RoomLiveDeps) {
    this.#deps = deps;
    this.sharer = new RoomLiveSharerStore({ ...deps, meId: () => deps.presence.meId, share: () => this.share, sharerName: () => this.sharerName });
    makeAutoObservable(this, { screen: observableRef, sharer: false }, { autoBind: true });
  }

  get isOn(): boolean {
    return this.share !== null;
  }

  get isMine(): boolean {
    return this.share !== null && this.share.sharerId === this.#deps.presence.meId;
  }

  get sharerName(): string {
    const id = this.share?.sharerId;

    return id ? (this.#deps.presence.find(id)?.name ?? '') : '';
  }

  // The tag on the screen: "Live · Anna".
  get tagLabel(): string {
    return this.isMine ? this.#deps.t('live.tagYou') : this.#deps.t('live.tag', { name: this.sharerName });
  }

  // The line under the screen: what a share means for the room.
  get noteLabel(): string {
    return this.isMine ? this.#deps.t('live.yours') : this.#deps.t('live.theirs', { name: this.sharerName });
  }

  get isSoundBlocked(): boolean {
    void this.version;

    return this.isOn && !this.isMine && (this.screen?.soundBlocked ?? false);
  }

  receive(share: ShareSnapshot | null): void {
    this.share = share;
    this.sharer.receive(share);
  }

  // The screen is on the page: the live screen's video goes into its element.
  mount(element: HTMLElement): void {
    if (this.screen) return;

    this.screen = this.#deps.liveMedia.attach(element, { changed: () => this.bump() });

    this.#stops = [
      reaction(() => [this.share, this.isMine, this.sharer.capture, this.screen] as const, this.apply, { fireImmediately: true }),
      reaction(() => [this.#deps.volume(), this.screen] as const, ([volume, screen]) => screen?.setVolume(volume), { fireImmediately: true }),
      this.#deps.repeat(this.report, liveLimits.statsIntervalMs),
    ];
  }

  detach(): void {
    this.#stops.forEach((stop) => stop());
    this.#stops = [];
    this.screen?.destroy();
    this.screen = null;
  }

  bump(): void {
    this.version += 1;
  }

  allowSound(): void {
    this.screen?.allowSound();
  }

  apply(): void {
    const { screen, share } = this;

    if (!screen) return;

    if (!share) return screen.clear();

    const own = this.isMine ? this.sharer.capture : null;

    if (own) screen.preview(own);
    else if (this.isMine) screen.clear();
    else screen.watch(share.path);
  }

  report(): void {
    if (!this.screen || !this.isOn || this.isMine) return;

    void this.screen.fps().then((fps) => {
      if (fps !== null) this.#deps.send('watchStats', { fps: Math.min(240, Math.max(0, fps)) });
    });
  }
}
