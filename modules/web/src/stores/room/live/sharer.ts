import { liveQualityOrder, type CinemaErrorCode, type CinemaShareKeyEvent, type LiveQuality, type ShareSnapshot } from '@cinemate/protocol';
import { makeAutoObservable, observableRef } from 'mobx';
import type { LiveCaptureResult, LiveMediaService, LiveShare } from '../../../services';
import type { Translate } from '../../locale';
import type { CinemaSend } from '../types';

export interface RoomLiveSharerDeps {
  t: Translate;
  liveMedia: LiveMediaService;
  send: CinemaSend;
  meId: () => string;
  // The room's share, whoever's it is.
  share: () => ShareSnapshot | null;
  sharerName: () => string;
}

// idle → picking (Chrome's picker is open) → starting (the room said yes or no; then the relay) →
// sharing. Stopping, Chrome's own "Stop sharing", or the room ending it goes back to idle.
export type RoomLiveSharerState = 'idle' | 'picking' | 'starting' | 'sharing';

// Why the last try didn't work out, shown under the screen until the next one.
export type RoomLiveSharerProblem = 'taken' | 'unsupported' | 'failed' | 'noSound';

export interface RoomLiveSharerQualityOption {
  value: LiveQuality;
  label: string;
}

// Your side of a live share (spec §14.1, D28, D29, D32): the Share button, the browser's picker, asking
// the room, and sending the picked tab to the relay with the key only you are given; the quality
// everyone gets and whether its sound goes out, both changeable while it's live.
export class RoomLiveSharerStore {
  state: RoomLiveSharerState = 'idle';
  capture: LiveShare | null = null;
  problem: RoomLiveSharerProblem | null = null;
  quality: LiveQuality = 'best';
  isSoundOn = true;
  readonly #deps: RoomLiveSharerDeps;

  constructor(deps: RoomLiveSharerDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { capture: observableRef }, { autoBind: true });
  }

  get isSharing(): boolean {
    return this.state === 'starting' || this.state === 'sharing';
  }

  // Someone else is sharing: one at a time (D29).
  get isBlocked(): boolean {
    const share = this.#deps.share();

    return share !== null && share.sharerId !== this.#deps.meId();
  }

  get buttonLabel(): string {
    const { t } = this.#deps;

    if (this.state === 'picking' || this.state === 'starting') return t('live.starting');

    return t(this.isSharing ? 'live.stop' : 'live.share');
  }

  get buttonHint(): string {
    const { t } = this.#deps;

    if (this.isBlocked) return t('live.taken', { name: this.#deps.sharerName() });

    return t(this.isSharing ? 'live.stopHint' : 'live.shareHint');
  }

  get qualityOptions(): RoomLiveSharerQualityOption[] {
    return liveQualityOrder.map((value) => ({ value, label: this.#deps.t(`live.quality.${value}`) }));
  }

  get qualityLabel(): string {
    return this.#deps.t(`live.quality.${this.quality}`);
  }

  // Only a capture with sound has any to switch.
  get hasSound(): boolean {
    return this.capture?.hasSound ?? false;
  }

  get soundLabel(): string {
    return this.#deps.t(this.isSoundOn ? 'live.soundOff' : 'live.soundOn');
  }

  get problemLabel(): string {
    return this.problem ? this.#deps.t(`live.problem.${this.problem}`, { name: this.#deps.sharerName() }) : '';
  }

  toggle(): void {
    if (this.isSharing) this.stop();
    else void this.start();
  }

  async start(): Promise<void> {
    if (this.state !== 'idle' || this.isBlocked) return;

    this.state = 'picking';
    this.problem = null;
    this.picked(await this.#deps.liveMedia.capture(this.quality, this.stop));
  }

  // From the menu: one of the qualities, or nothing.
  pickQuality(value: string): void {
    const quality = liveQualityOrder.find((option) => option === value);

    if (quality) this.setQuality(quality);
  }

  setQuality(quality: LiveQuality): void {
    this.quality = quality;
    void this.capture?.setQuality(quality);
  }

  toggleSound(): void {
    this.isSoundOn = !this.isSoundOn;
    this.capture?.setSound(this.isSoundOn);
  }

  picked(result: LiveCaptureResult): void {
    if (this.state !== 'picking') return result.ok ? result.share.stop() : undefined;

    if (!result.ok) {
      this.state = 'idle';
      this.problem = result.reason === 'unsupported' ? 'unsupported' : null;

      return;
    }

    this.capture = result.share;
    this.capture.setSound(this.isSoundOn);
    this.state = 'starting';
    this.#deps.send('startShare', {});
  }

  // The room said yes: off to the relay.
  receiveKey({ path, key }: CinemaShareKeyEvent): void {
    const { capture } = this;

    if (this.state !== 'starting' || !capture) return;

    this.#deps.liveMedia.publish(capture, path, key).then(
      () => this.published(capture),
      () => this.failed(capture),
    );
  }

  published(capture: LiveShare): void {
    if (this.capture !== capture || this.state !== 'starting') return;

    this.state = 'sharing';

    if (!capture.hasSound) this.problem = 'noSound';
  }

  failed(capture: LiveShare): void {
    if (this.capture !== capture) return;

    this.problem = 'failed';
    this.stop();
  }

  // The room said no: someone else got there first.
  refuse(code: CinemaErrorCode): void {
    if (this.state !== 'starting') return;

    this.problem = code === 'SHARE_TAKEN' ? 'taken' : 'failed';
    this.#end();
  }

  stop(): void {
    if (this.state === 'idle') return;

    if (this.isSharing) this.#deps.send('stopShare', {});

    this.#end();
  }

  // The room's view: if it no longer has your share (it ended it), stop sending.
  receive(share: ShareSnapshot | null): void {
    if (this.state === 'sharing' && share?.sharerId !== this.#deps.meId()) this.#end();
  }

  dismissProblem(): void {
    this.problem = null;
  }

  #end(): void {
    this.capture?.stop();
    this.capture = null;
    this.state = 'idle';
  }
}
