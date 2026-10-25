import type { MediaErrorCode, MediaSource, PlayerState } from '@cinemate/protocol';
import type Hls from 'hls.js';
import type { QualityChoice, ScreenPlayer, ScreenPlayerListeners, VolumePreference } from '../types';
import { canPlaySound, isSilent } from './sound';

// The video element's "enough data to keep playing".
const haveFutureData = 3;

const watchedEvents = ['loadedmetadata', 'canplay', 'playing', 'pause', 'waiting', 'seeking', 'seeked', 'ended', 'timeupdate', 'volumechange'] as const;

const errorOf = (video: HTMLVideoElement): MediaErrorCode => (video.error?.code === MediaError.MEDIA_ERR_NETWORK ? 'network' : 'unsupported');

// The screen's player for video files and HLS streams: the browser's own video element, with
// hls.js where the browser can't play HLS itself. Our own control bar drives it, so it has no
// buttons of its own and never reports user actions. Before anyone has clicked on the page, it plays
// muted (browsers allow that) and says the sound is waiting for a click.
export class VideoScreenPlayer implements ScreenPlayer {
  itemId: string | null = null;
  readonly #listeners: ScreenPlayerListeners;
  readonly #video: HTMLVideoElement;
  #hls: Hls | null = null;
  #ready = false;
  #target = 0;
  #intent: 'playing' | 'paused' = 'paused';
  #volume: VolumePreference = { volume: 100, muted: false };
  #soundBlocked = false;
  readonly #onEvent = (): void => this.#changed();
  readonly #onError = (): void => this.#listeners.failed(errorOf(this.#video));

  constructor(element: HTMLElement, listeners: ScreenPlayerListeners) {
    this.#listeners = listeners;
    this.#video = document.createElement('video');
    this.#video.playsInline = true;
    this.#video.preload = 'auto';
    element.append(this.#video);
    watchedEvents.forEach((type) => this.#video.addEventListener(type, this.#onEvent));
    this.#video.addEventListener('error', this.#onError);
  }

  load(itemId: string, source: MediaSource, position: number): void {
    this.#reset();
    this.itemId = itemId;
    this.#target = position;

    if (source.kind === 'hls' && !this.#video.canPlayType('application/vnd.apple.mpegurl')) void this.#attachHls(source.ref);
    else this.#video.src = source.ref;

    this.#listeners.changed();
  }

  play(): void {
    this.#intent = 'playing';

    if (!canPlaySound() && !this.#volume.muted) this.#blockSound();

    this.#video.play().catch((error: unknown) => this.#retryMuted(error));
  }

  pause(): void {
    this.#intent = 'paused';
    this.#video.pause();
  }

  seek(position: number): void {
    this.#video.currentTime = position;
  }

  stop(): void {
    this.#reset();
    this.itemId = null;
    this.#listeners.changed();
  }

  time(): number {
    return this.#video.currentTime;
  }

  state(): PlayerState {
    const video = this.#video;

    if (this.itemId === null) return 'idle';

    if (!this.#ready) return 'loading';

    if (video.ended) return 'ended';

    if (video.seeking || video.readyState < haveFutureData) return this.#intent === 'playing' ? 'buffering' : 'loading';

    return video.paused ? 'paused' : 'playing';
  }

  setVolume(volume: VolumePreference): void {
    this.#volume = volume;
    this.#applyVolume();
  }

  quality(): QualityChoice | null {
    const hls = this.#hls;
    const height = this.#video.videoHeight;

    if (!hls) return height > 0 ? { levels: [], current: -1, label: `${height}p` } : null;

    const levels = hls.levels.map((level, index) => ({ index, label: `${level.height}p` }));
    const playingLevel = hls.levels[hls.currentLevel];

    return { levels, current: hls.autoLevelEnabled ? -1 : hls.currentLevel, label: playingLevel ? `${playingLevel.height}p` : null };
  }

  setQuality(index: number): void {
    if (this.#hls) this.#hls.currentLevel = index;
  }

  soundBlocked(): boolean {
    return this.#soundBlocked;
  }

  // A click on the page: sound is allowed now.
  allowSound(): void {
    if (!this.#soundBlocked) return;

    this.#soundBlocked = false;
    this.#applyVolume();
    this.#listeners.changed();
  }

  destroy(): void {
    this.#reset();
    watchedEvents.forEach((type) => this.#video.removeEventListener(type, this.#onEvent));
    this.#video.removeEventListener('error', this.#onError);
    this.#video.remove();
  }

  #reset(): void {
    this.#hls?.destroy();
    this.#hls = null;
    this.#ready = false;
    this.#intent = 'paused';
    this.#video.pause();
    this.#video.removeAttribute('src');
    this.#video.load();
  }

  async #attachHls(url: string): Promise<void> {
    const hlsJs = (await import('hls.js')).default;

    if (!hlsJs.isSupported()) return this.#listeners.failed('unsupported');

    const hls = new hlsJs();

    hls.on(hlsJs.Events.ERROR, (_event, data) => {
      if (data.fatal) this.#listeners.failed(data.response?.code === 404 ? 'notFound' : data.type === 'networkError' ? 'network' : 'unsupported');
    });

    hls.loadSource(url);
    hls.attachMedia(this.#video);
    this.#hls = hls;
  }

  // Ready once it's at the position with enough data to play: then it says how long it is.
  #changed(): void {
    const video = this.#video;

    if (!this.#ready && this.itemId !== null && video.readyState >= 1) {
      if (Math.abs(video.currentTime - this.#target) > 0.05 && !video.seeking) video.currentTime = this.#target;
      else if (!video.seeking && video.readyState >= haveFutureData) this.#markReady();
    }

    this.#listeners.changed();
  }

  #markReady(): void {
    this.#ready = true;
    this.#listeners.described(Number.isFinite(this.#video.duration) ? this.#video.duration : 0, null);
  }

  #applyVolume(): void {
    this.#video.volume = this.#volume.volume / 100;
    this.#video.muted = this.#volume.muted || this.#soundBlocked || isSilent();
  }

  #blockSound(): void {
    this.#soundBlocked = true;
    this.#applyVolume();
    this.#listeners.changed();
  }

  // The browser still said no to sound: play muted instead.
  #retryMuted(error: unknown): void {
    if (!(error instanceof DOMException) || error.name !== 'NotAllowedError' || this.#video.muted) return;

    this.#blockSound();
    void this.#video.play().catch(() => undefined);
  }
}
