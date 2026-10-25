import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';

export interface UiNoticeDeps {
  schedule: Schedule;
}

// How long a notice stays up.
const shownMs = 6000;

// hidden ⇄ shown: one line over the room saying why something changed by itself , such
// as a video that couldn't be played and was skipped. A new notice replaces the one showing.
export type UiNoticeState = 'hidden' | 'shown';

export class UiNoticeStore {
  state: UiNoticeState = 'hidden';
  text = '';
  #cancel: (() => void) | null = null;
  readonly #deps: UiNoticeDeps;

  constructor(deps: UiNoticeDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isShown(): boolean {
    return this.state === 'shown';
  }

  show(text: string): void {
    this.#cancel?.();
    this.text = text;
    this.state = 'shown';
    this.#cancel = this.#deps.schedule(this.hide, shownMs);
  }

  hide(): void {
    this.#cancel?.();
    this.#cancel = null;
    this.state = 'hidden';
  }
}
