import { syncLimits } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { RoomPresenceStore, ViewerView } from '../presence';
import type { CinemaSend } from '../types';
import type { RoomScreenStore } from '.';

export interface RoomScreenWaitingDeps {
  t: Translate;
  presence: RoomPresenceStore;
  send: CinemaSend;
  screen: RoomScreenStore;
}

// The waiting slate (D7): who the room waits for, why, for how long, how often they've done it
// tonight, and after 20 s a way for everyone else to go on without them (D10).
export class RoomScreenWaitingStore {
  readonly #deps: RoomScreenWaitingDeps;

  constructor(deps: RoomScreenWaitingDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get waitedMs(): number {
    const { phase, waitSince } = this.#deps.screen.playback;

    return phase === 'loading' && waitSince !== null ? Math.max(0, this.#deps.screen.serverNow - waitSince) : 0;
  }

  // Who the room waits for, as people.
  get viewers(): ViewerView[] {
    const { presence, screen } = this.#deps;

    return screen.playback.waitingFor.map((id) => presence.find(id)).filter((view): view is ViewerView => view !== undefined);
  }

  get first(): ViewerView | undefined {
    return this.viewers[0];
  }

  // A short load nobody notices isn't worth a slate: it shows once it's long enough to blame anyone.
  get isShown(): boolean {
    return this.viewers.length > 0 && this.waitedMs >= syncLimits.slowpokeAfterMs;
  }

  get isMeWaitedFor(): boolean {
    return this.viewers.some((view) => view.isMe);
  }

  get title(): string {
    const { t } = this.#deps;
    const [first, ...rest] = this.viewers;

    if (!first) return '';

    if (rest.length > 0) return t('screen.waiting.many', { names: this.#names });

    return first.isMe ? t('screen.waiting.you') : t('screen.waiting.one', { name: first.name });
  }

  get reason(): string {
    const { first } = this;

    return first ? this.#deps.t('screen.waiting.reason', { reason: this.#deps.t(`screen.reason.${first.status}`), count: Math.floor(this.waitedMs / 1000) }) : '';
  }

  get others(): string {
    const others = this.#deps.presence.watching.length - this.viewers.length;

    return others > 0 ? this.#deps.t('screen.waiting.others') : '';
  }

  get tally(): string {
    const { first } = this;

    if (!first || first.slowpokes === 0 || this.viewers.length > 1) return '';

    return this.#deps.t(first.isMe ? 'screen.waiting.tallyYou' : 'screen.waiting.tally', { name: first.name, count: first.slowpokes });
  }

  get canGoOn(): boolean {
    return this.waitedMs >= syncLimits.goOnAfterMs && !this.isMeWaitedFor;
  }

  get goOnLabel(): string {
    return this.#deps.t('screen.goOn.label', { names: this.#names });
  }

  get goOnHint(): string {
    return this.#deps.t('screen.goOn.hint', { names: this.#names, count: this.viewers.length });
  }

  goOn(): void {
    if (this.canGoOn) this.#deps.send('goOnWithout', {});
  }

  get #names(): string {
    return this.viewers.map((view) => view.name).join(', ');
  }
}
