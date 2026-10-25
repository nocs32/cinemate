import { makeAutoObservable, reaction } from 'mobx';
import type { FullscreenService, PreferencesService, QualityChoice, VolumePreference } from '../../../services';
import { formatClock } from '../../../utils';
import type { Translate } from '../../locale';
import type { CinemaSend } from '../types';
import type { RoomScreenStore } from '.';
import type { RoomScreenDriverStore } from './driver';

export interface RoomScreenControlsDeps {
  t: Translate;
  screen: RoomScreenStore;
  driver: RoomScreenDriverStore;
  send: CinemaSend;
  preferences: PreferencesService;
  fullscreen: FullscreenService;
}

const jumpSeconds = 10;

// The control bar under a file's video (spec §9, the style board): play, jump back and forward, and
// the scrubber, all for everyone; volume, quality and fullscreen just for you. YouTube videos use
// YouTube's own bar instead (D12). Scrubbing: idle → scrubbing (dragging, nothing sent) → idle (the
// seek goes to the room).
export class RoomScreenControlsStore {
  volume: VolumePreference;
  scrubbing: number | null = null;
  isFullscreen = false;
  readonly #deps: RoomScreenControlsDeps;
  #stops: Array<() => void> = [];

  constructor(deps: RoomScreenControlsDeps) {
    this.#deps = deps;
    this.volume = deps.preferences.loadVolume() ?? { volume: 80, muted: false };
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isPlaying(): boolean {
    return this.#deps.screen.isPlaying;
  }

  get playLabel(): string {
    return this.#deps.t(this.isPlaying ? 'controls.pause' : 'controls.play');
  }

  get duration(): number {
    return this.#deps.screen.item?.duration ?? 0;
  }

  get position(): number {
    return this.scrubbing ?? Math.min(this.#deps.screen.expected, this.duration || Infinity);
  }

  get progress(): number {
    return this.duration > 0 ? Math.min(1, this.position / this.duration) : 0;
  }

  get positionLabel(): string {
    return formatClock(this.position);
  }

  get durationLabel(): string {
    return this.duration > 0 ? formatClock(this.duration) : '–:––';
  }

  get canScrub(): boolean {
    return this.duration > 0 && this.#deps.screen.hasVideo;
  }

  get volumeLabel(): string {
    return this.#deps.t(this.volume.muted ? 'controls.unmute' : 'controls.mute');
  }

  get isMuted(): boolean {
    return this.volume.muted || this.volume.volume === 0;
  }

  // What the volume slider shows: nothing while muted.
  get volumeValue(): number {
    return this.isMuted ? 0 : this.volume.volume;
  }

  get volumeFill(): number {
    return this.volumeValue / 100;
  }

  // Re-read with the player: the stream's levels and the one it plays now.
  get quality(): QualityChoice | null {
    void this.#deps.driver.version;

    return this.#deps.driver.player?.quality() ?? null;
  }

  get qualityLabel(): string {
    const { quality } = this;

    if (!quality) return this.#deps.t('controls.qualityAuto');

    return quality.current === -1 && quality.levels.length > 0 ? this.#deps.t('controls.qualityAutoAt', { label: quality.label ?? '' }) : (quality.label ?? '');
  }

  get canPickQuality(): boolean {
    return (this.quality?.levels.length ?? 0) > 1;
  }

  get fullscreenLabel(): string {
    return this.#deps.t(this.isFullscreen ? 'controls.exitFullscreen' : 'controls.fullscreen');
  }

  // Volume follows the player as it changes; fullscreen follows the browser.
  start(): void {
    this.#stops = [reaction(() => [this.volume, this.#deps.driver.player] as const, ([volume, player]) => player?.setVolume(volume), { fireImmediately: true }), this.#deps.fullscreen.listen(this.syncFullscreen)];
  }

  togglePlay(): void {
    if (this.#deps.screen.hasVideo) this.#deps.send(this.isPlaying ? 'pause' : 'play', {});
  }

  back(): void {
    this.#seek(this.position - jumpSeconds);
  }

  forward(): void {
    this.#seek(this.position + jumpSeconds);
  }

  scrub(position: number): void {
    if (this.canScrub) this.scrubbing = position;
  }

  commitScrub(): void {
    if (this.scrubbing === null) return;

    this.#seek(this.scrubbing);
    this.scrubbing = null;
  }

  setVolume(volume: number): void {
    this.#saveVolume({ volume: Math.round(volume), muted: volume === 0 });
  }

  toggleMute(): void {
    this.#saveVolume({ ...this.volume, muted: !this.volume.muted, volume: this.volume.volume || 50 });
  }

  pickQuality(index: number): void {
    this.#deps.driver.player?.setQuality(index);
    this.#deps.driver.bump();
  }

  // The screen and what's drawn over it go fullscreen together.
  setFullscreenTarget(element: HTMLElement | null): void {
    this.#deps.fullscreen.setTarget(element);
  }

  toggleFullscreen(): void {
    this.#deps.fullscreen.toggle();
  }

  syncFullscreen(): void {
    this.isFullscreen = this.#deps.fullscreen.isOn();
  }

  dispose(): void {
    this.#stops.forEach((stop) => stop());
  }

  #seek(position: number): void {
    if (this.#deps.screen.hasVideo) this.#deps.send('seek', { position: Math.max(0, Math.min(position, this.duration || position)) });
  }

  #saveVolume(volume: VolumePreference): void {
    this.volume = volume;
    this.#deps.preferences.saveVolume(volume);
  }
}
