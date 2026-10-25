import { liveLimits } from '@cinemate/protocol';
import { canPlaySound, isSilent } from '../players/sound';
import type { LiveScreen, LiveScreenListeners, LiveShare, Schedule, VolumePreference } from '../types';
import { hangUp, negotiate } from './whip';

export interface LiveMediaScreenDeps {
  // The relay's address for a path, ending in /whep (null: there's no relay, the demo room).
  whepUrl: ((path: string) => string) | null;
  schedule: Schedule;
}

// The video element over the screen that shows a live share (spec §14.1): the room's share from the
// relay over WHEP, or the sharer's own capture straight from the browser (silent, never through the
// relay). If the stream isn't there yet (the sharer is still connecting) or the connection drops, it
// tries again. Before anyone has clicked on the page it plays muted, like the file player.
export class LiveMediaScreen implements LiveScreen {
  readonly #video: HTMLVideoElement;
  readonly #listeners: LiveScreenListeners;
  readonly #deps: LiveMediaScreenDeps;
  #url: string | null = null;
  #pc: RTCPeerConnection | null = null;
  #session: string | null = null;
  #cancelRetry: (() => void) | null = null;
  #volume: VolumePreference = { volume: 100, muted: false };
  #soundBlocked = false;
  #lastFrames: { frames: number; at: number } | null = null;

  constructor(element: HTMLElement, listeners: LiveScreenListeners, deps: LiveMediaScreenDeps) {
    this.#listeners = listeners;
    this.#deps = deps;
    this.#video = document.createElement('video');
    this.#video.playsInline = true;
    element.append(this.#video);
  }

  get soundBlocked(): boolean {
    return this.#soundBlocked;
  }

  watch(path: string): void {
    const url = this.#deps.whepUrl?.(path) ?? null;

    if (url === this.#url) return;

    this.clear();
    this.#url = url;

    if (url) void this.#connect(url);
  }

  preview(share: LiveShare): void {
    if (this.#video.srcObject === share.stream) return;

    this.clear();
    this.#video.srcObject = share.stream;
    this.#video.muted = true;
    void this.#video.play().catch(() => undefined);
  }

  clear(): void {
    this.#url = null;
    this.#cancelRetry?.();
    this.#cancelRetry = null;
    this.#hangUp();
    this.#video.srcObject = null;
    this.#lastFrames = null;
  }

  setVolume(volume: VolumePreference): void {
    this.#volume = volume;
    this.#applyVolume();
  }

  allowSound(): void {
    if (!this.#soundBlocked) return;

    this.#soundBlocked = false;
    this.#applyVolume();
    this.#listeners.changed();
  }

  // Frames a second on this screen, from the decoder's count since the last time it was asked.
  async fps(): Promise<number | null> {
    const stats = await this.#pc?.getStats();
    const inbound = stats ? [...stats.values()].find((entry: RTCStats) => entry.type === 'inbound-rtp' && (entry as RTCInboundRtpStreamStats).kind === 'video') : undefined;
    const frames = (inbound as RTCInboundRtpStreamStats | undefined)?.framesDecoded;

    if (frames === undefined) return null;

    const now = performance.now();
    const last = this.#lastFrames;

    this.#lastFrames = { frames, at: now };

    return last && now > last.at ? ((frames - last.frames) * 1000) / (now - last.at) : null;
  }

  destroy(): void {
    this.clear();
    this.#video.remove();
  }

  async #connect(url: string): Promise<void> {
    const pc = new RTCPeerConnection();
    const stream = new MediaStream();

    this.#pc = pc;
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });
    pc.addEventListener('track', (event) => stream.addTrack(event.track));

    pc.addEventListener('connectionstatechange', () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') this.#retry(pc, url);
    });

    try {
      const session = await negotiate(pc, url);

      if (pc !== this.#pc) return hangUp(session);

      this.#session = session;
    } catch {
      return this.#retry(pc, url);
    }

    this.#video.srcObject = stream;
    this.#play();
  }

  #play(): void {
    if (!canPlaySound() && !this.#volume.muted) this.#soundBlocked = true;

    this.#applyVolume();

    this.#video.play().catch(() => {
      this.#soundBlocked = true;
      this.#applyVolume();
      void this.#video.play().catch(() => undefined);
    });

    this.#listeners.changed();
  }

  #retry(pc: RTCPeerConnection, url: string): void {
    if (pc !== this.#pc || url !== this.#url) return;

    this.#hangUp();

    this.#cancelRetry = this.#deps.schedule(() => {
      if (url === this.#url) void this.#connect(url);
    }, liveLimits.retryMs);
  }

  #hangUp(): void {
    hangUp(this.#session);
    this.#session = null;

    const pc = this.#pc;

    this.#pc = null;
    pc?.close();
  }

  #applyVolume(): void {
    if (this.#video.srcObject && !this.#url) return;

    this.#video.muted = this.#soundBlocked || this.#volume.muted || isSilent();
    this.#video.volume = this.#volume.volume / 100;
  }
}
