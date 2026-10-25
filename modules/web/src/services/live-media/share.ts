import { liveLimits, liveQualities, type LiveQuality } from '@cinemate/protocol';
import type { LiveShare } from '../types';
import { bitrateFloor, stereoOpus } from './sdp';
import { hangUp, negotiate } from './whip';

const preferCodecs = (transceiver: RTCRtpTransceiver): void => {
  const codecs = RTCRtpSender.getCapabilities('video')?.codecs ?? [];

  const rank = (codec: RTCRtpCodec): number => {
    const index = (liveLimits.codecs as readonly string[]).indexOf(codec.mimeType);

    return index === -1 ? liveLimits.codecs.length : index;
  };

  transceiver.setCodecPreferences([...codecs].sort((a, b) => rank(a) - rank(b)));
};

// A picked tab or screen, and (once the room said yes) its trip to the relay over WHIP (spec §14.2):
// at the sharer's quality (size, frames a second, top bitrate, D32), holding the frame rate over
// sharpness, with the tab's sound in stereo. Quality and sound can change while it's live.
export class LiveMediaShare implements LiveShare {
  readonly stream: MediaStream;
  #quality: LiveQuality;
  #pc: RTCPeerConnection | null = null;
  #video: RTCRtpSender | null = null;
  #session: string | null = null;
  #stopped = false;

  constructor(stream: MediaStream, quality: LiveQuality, ended: () => void) {
    this.stream = stream;
    this.#quality = quality;

    stream.getVideoTracks().forEach((track) => {
      track.contentHint = 'motion';
      track.addEventListener('ended', ended);
    });

    void this.#shape();
  }

  get hasSound(): boolean {
    return this.stream.getAudioTracks().length > 0;
  }

  async publish(url: string, key: string): Promise<void> {
    const pc = new RTCPeerConnection();
    const [video] = this.stream.getVideoTracks();
    const [audio] = this.stream.getAudioTracks();

    this.#pc = pc;

    if (video) await this.#addVideo(pc, video);

    if (audio) pc.addTransceiver(audio, { direction: 'sendonly', streams: [this.stream], sendEncodings: [{ maxBitrate: liveLimits.audioBitrate }] });

    const session = await negotiate(pc, url, { token: key, mungeOffer: stereoOpus, mungeAnswer: bitrateFloor(liveQualities[this.#quality].mbps) });

    if (this.#stopped) return hangUp(session);

    this.#session = session;
  }

  async setQuality(quality: LiveQuality): Promise<void> {
    this.#quality = quality;
    await this.#shape();
    await this.#limit();
  }

  // Sound off sends silence; the tab keeps playing for the sharer.
  setSound(on: boolean): void {
    this.stream.getAudioTracks().forEach((track) => {
      track.enabled = on;
    });
  }

  stop(): void {
    this.#stopped = true;
    hangUp(this.#session);
    this.#session = null;
    this.#pc?.close();
    this.#pc = null;
    this.stream.getTracks().forEach((track) => track.stop());
  }

  // The capture's size and frame rate, at most the quality's.
  async #shape(): Promise<void> {
    const { width, height, frameRate } = liveQualities[this.#quality];

    await Promise.all(this.stream.getVideoTracks().map((track) => track.applyConstraints({ width: { max: width }, height: { max: height }, frameRate: { max: frameRate } }).catch(() => undefined)));
  }

  async #limit(): Promise<void> {
    const sender = this.#video;

    if (!sender) return;

    const parameters = sender.getParameters();
    const { mbps, frameRate } = liveQualities[this.#quality];
    const encodings = parameters.encodings.map((encoding) => ({ ...encoding, maxBitrate: mbps * 1_000_000, maxFramerate: frameRate }));

    await sender.setParameters({ ...parameters, encodings }).catch(() => undefined);
  }

  async #addVideo(pc: RTCPeerConnection, video: MediaStreamTrack): Promise<void> {
    const { mbps, frameRate } = liveQualities[this.#quality];

    const transceiver = pc.addTransceiver(video, {
      direction: 'sendonly',
      streams: [this.stream],
      sendEncodings: [{ maxBitrate: mbps * 1_000_000, maxFramerate: frameRate, scaleResolutionDownBy: 1 }],
    });

    preferCodecs(transceiver);
    this.#video = transceiver.sender;

    const parameters = transceiver.sender.getParameters();

    await transceiver.sender.setParameters({ ...parameters, degradationPreference: 'maintain-framerate' });
  }
}
