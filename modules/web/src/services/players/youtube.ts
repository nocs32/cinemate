import type { MediaErrorCode, MediaSource, PlayerState } from '@cinemate/protocol';
import type { QualityChoice, ScreenPlayer, ScreenPlayerListeners } from '../types';

// YouTube's player states (YT.PlayerState), spelled out so this file needs YT only at run time.
const ended = 0;
const playing = 1;
const paused = 2;
const buffering = 3;
const cued = 5;

const pollMs = 250;
// Playing, but the time hasn't moved for this long: loading, or an ad (spec §4.3).
const stuckAfterMs = 1500;
// The time jumped by more than this without us seeking: someone used YouTube's own bar (D12).
const seekJumpSeconds = 1.5;

const errorCodes: Readonly<Record<number, MediaErrorCode>> = { 2: 'notFound', 5: 'unsupported', 100: 'notFound', 101: 'blocked', 150: 'blocked', 153: 'blocked' };

interface VideoData {
  title?: string;
}

// The screen's YouTube player, with YouTube's own bar showing (D12): clicks on it come back as user
// actions. Getting ready is the spike's trick (spec §12 M−1): play muted until it plays, then pause
// and seek back, so the video is buffered when the room starts.
export class YouTubeScreenPlayer implements ScreenPlayer {
  itemId: string | null = null;
  readonly #listeners: ScreenPlayerListeners;
  readonly #mount: HTMLElement;
  readonly #api: () => Promise<typeof YT>;
  #player: YT.Player | null = null;
  #priming: number | null = null;
  // Whether the person had muted YouTube themselves before getting ready muted.
  #wasMuted = false;
  #intent: 'playing' | 'paused' = 'paused';
  #lastTime = 0;
  #lastAt = 0;
  #movedAt = 0;
  #ownSeekAt = 0;
  #stopPoll: (() => void) | null = null;

  constructor(element: HTMLElement, listeners: ScreenPlayerListeners, api: () => Promise<typeof YT>) {
    this.#listeners = listeners;
    this.#api = api;
    this.#mount = document.createElement('div');
    element.append(this.#mount);
  }

  load(itemId: string, source: MediaSource, position: number): void {
    this.itemId = itemId;
    this.#priming = position;
    this.#intent = 'paused';

    if (this.#player) this.#prime(source.ref, position);
    else void this.#create(source.ref, position);

    this.#listeners.changed();
  }

  play(): void {
    this.#intent = 'playing';
    this.#player?.playVideo();
  }

  pause(): void {
    this.#intent = 'paused';
    this.#player?.pauseVideo();
  }

  seek(position: number): void {
    this.#ownSeekAt = performance.now();
    this.#lastTime = position;
    this.#player?.seekTo(position, true);
  }

  stop(): void {
    this.itemId = null;
    this.#priming = null;
    this.#intent = 'paused';
    this.#player?.stopVideo();
  }

  time(): number {
    return this.#player?.getCurrentTime?.() ?? 0;
  }

  state(): PlayerState {
    if (!this.#player || this.itemId === null) return 'idle';

    if (this.#priming !== null) return 'loading';

    const state = this.#player.getPlayerState();

    if (state === playing) return performance.now() - this.#movedAt > stuckAfterMs ? 'stuck' : 'playing';

    if (state === paused) return 'paused';

    if (state === buffering) return 'buffering';

    if (state === ended) return 'ended';

    return state === cued ? 'ready' : 'loading';
  }

  // YouTube's own bar has volume, quality and subtitles.
  setVolume(): void {}

  quality(): QualityChoice | null {
    return null;
  }

  setQuality(): void {}

  needsClick(): boolean {
    return false;
  }

  destroy(): void {
    this.#stopPoll?.();
    this.#player?.destroy();
    this.#player = null;
    this.#mount.remove();
  }

  async #create(videoId: string, position: number): Promise<void> {
    const api = await this.#api();

    this.#player = new api.Player(this.#mount, {
      width: '100%',
      height: '100%',
      playerVars: { controls: 1, playsinline: 1, rel: 0, origin: window.location.origin },
      events: {
        onReady: () => this.#prime(videoId, position),
        onStateChange: (event) => this.#changed(event.data),
        onError: (event) => this.#listeners.failed(errorCodes[event.data] ?? 'unsupported'),
      },
    });

    this.#stopPoll = this.#startPoll();
  }

  #prime(videoId: string, position: number): void {
    const player = this.#player;

    if (!player) return;

    this.#wasMuted = player.isMuted();
    player.mute();
    player.loadVideoById({ videoId, startSeconds: position });
  }

  #changed(state: number): void {
    if (this.#priming !== null) return this.#primed(state);

    if (state === paused && this.#intent === 'playing') {
      this.#intent = 'paused';
      this.#listeners.userAction({ type: 'pause' });
    } else if (state === playing && this.#intent === 'paused') {
      this.#intent = 'playing';
      this.#listeners.userAction({ type: 'play' });
    }

    this.#listeners.changed();
  }

  // Playing muted for the first time: buffered. Pause, go back to the position, sound back on.
  #primed(state: number): void {
    const player = this.#player;
    const position = this.#priming;

    if (!player || position === null || state !== playing) return;

    player.pauseVideo();
    player.seekTo(position, true);

    if (!this.#wasMuted) player.unMute();

    this.#priming = null;
    this.#lastTime = position;
    this.#ownSeekAt = performance.now();
    this.#listeners.described(player.getDuration(), (player as unknown as { getVideoData?: () => VideoData }).getVideoData?.().title ?? null);
    this.#listeners.changed();
  }

  #startPoll(): () => void {
    const timer = window.setInterval(() => this.#poll(), pollMs);

    return () => window.clearInterval(timer);
  }

  // Notices time moving (for `stuck`) and jumps nobody here asked for (a seek in YouTube's bar).
  #poll(): void {
    const now = performance.now();
    const time = this.time();
    const elapsed = (now - this.#lastAt) / 1000;
    const isPlaying = this.#player?.getPlayerState() === playing;
    const expected = this.#lastTime + (isPlaying ? elapsed : 0);

    if (time !== this.#lastTime) this.#movedAt = now;

    if (this.#priming === null && this.itemId !== null && now - this.#ownSeekAt > 1000 && Math.abs(time - expected) > seekJumpSeconds) {
      this.#listeners.userAction({ type: 'seek', position: time });
    }

    this.#lastTime = time;
    this.#lastAt = now;
    this.#listeners.changed();
  }
}
