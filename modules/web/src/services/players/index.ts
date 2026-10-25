import type { MediaSource, PlayerState } from '@cinemate/protocol';
import type { QualityChoice, ScreenPlayer, ScreenPlayerFactory, ScreenPlayerListeners, VolumePreference } from '../types';
import { VideoScreenPlayer } from './video';
import { YouTubeScreenPlayer } from './youtube';
import { createYouTubeApi } from './youtube-api';

type PlayerKind = 'youtube' | 'video';

// The screen's player: hands each video to the YouTube player or the video element, swapping one
// for the other when the next video needs the other kind.
class ScreenPlayerHost implements ScreenPlayer {
  readonly #element: HTMLElement;
  readonly #listeners: ScreenPlayerListeners;
  readonly #youtubeApi: () => Promise<typeof YT>;
  #kind: PlayerKind | null = null;
  #player: ScreenPlayer | null = null;
  #volume: VolumePreference = { volume: 100, muted: false };

  constructor(element: HTMLElement, listeners: ScreenPlayerListeners, youtubeApi: () => Promise<typeof YT>) {
    this.#element = element;
    this.#listeners = listeners;
    this.#youtubeApi = youtubeApi;
  }

  get itemId(): string | null {
    return this.#player?.itemId ?? null;
  }

  load(itemId: string, source: MediaSource, position: number): void {
    const kind: PlayerKind = source.kind === 'youtube' ? 'youtube' : 'video';

    if (kind !== this.#kind) {
      this.#player?.destroy();
      this.#player = kind === 'youtube' ? new YouTubeScreenPlayer(this.#element, this.#listeners, this.#youtubeApi) : new VideoScreenPlayer(this.#element, this.#listeners);
      this.#player.setVolume(this.#volume);
      this.#kind = kind;
    }

    this.#player?.load(itemId, source, position);
  }

  play(): void {
    this.#player?.play();
  }

  pause(): void {
    this.#player?.pause();
  }

  seek(position: number): void {
    this.#player?.seek(position);
  }

  stop(): void {
    this.#player?.stop();
  }

  time(): number {
    return this.#player?.time() ?? 0;
  }

  state(): PlayerState {
    return this.#player?.state() ?? 'idle';
  }

  setVolume(volume: VolumePreference): void {
    this.#volume = volume;
    this.#player?.setVolume(volume);
  }

  quality(): QualityChoice | null {
    return this.#player?.quality() ?? null;
  }

  setQuality(index: number): void {
    this.#player?.setQuality(index);
  }

  needsClick(): boolean {
    return this.#player?.needsClick() ?? false;
  }

  destroy(): void {
    this.#player?.destroy();
    this.#player = null;
    this.#kind = null;
  }
}

export const createPlayerFactory = (): ScreenPlayerFactory => {
  const youtubeApi = createYouTubeApi();

  return (element, listeners) => new ScreenPlayerHost(element, listeners, youtubeApi);
};
