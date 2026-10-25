import { parseMediaLink } from '@cinemate/engine';
import { queueLimits, type CinemaErrorCode } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';
import type { Translate } from '../locale';

export interface RoomPasteDeps {
  t: Translate;
  schedule: Schedule;
  // Sends the link to the room; `owner` is told if the room turns it down.
  add: (url: string, owner: RoomPasteStore) => void;
}

const noteMs = 4000;

// The codes a refused link can come back with, each with a line saying why (spec §4.1).
const linkErrors = ['NOT_A_LINK', 'NOT_HTTPS', 'UNSUPPORTED_LINK', 'QUEUE_FULL'] as const;

type LinkErrorCode = (typeof linkErrors)[number];

const isLinkError = (code: CinemaErrorCode): code is LinkErrorCode => (linkErrors as readonly string[]).includes(code);

// A box to paste a video link into (the top bar's, and the empty screen's). Links are read here first,
// so a bad one gets its reason at once. States: idle ⇄ added (a moment of "Added") | refused (why).
export class RoomPasteStore {
  state: 'idle' | 'added' | 'refused' = 'idle';
  draft = '';
  error: LinkErrorCode | null = null;
  #cancel: (() => void) | null = null;
  readonly #deps: RoomPasteDeps;

  constructor(deps: RoomPasteDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get maxLength(): number {
    return queueLimits.linkMaxLength;
  }

  get canAdd(): boolean {
    return this.draft.trim().length > 0;
  }

  get note(): string | null {
    if (this.state === 'added') return this.#deps.t('paste.added');

    return this.state === 'refused' && this.error ? this.#deps.t(`paste.errors.${this.error}`) : null;
  }

  get isRefused(): boolean {
    return this.state === 'refused';
  }

  setDraft(text: string): void {
    this.draft = text.slice(0, queueLimits.linkMaxLength);

    if (this.state === 'refused') this.#settle('idle', null);
  }

  submit(): void {
    const url = this.draft.trim();

    if (!url) return;

    const result = parseMediaLink(url);

    if (!result.ok) return this.refuse(result.error);

    this.#deps.add(url, this);
    this.draft = '';
    this.#show('added', null);
  }

  refuse(code: CinemaErrorCode): void {
    if (isLinkError(code)) this.#show('refused', code);
  }

  reset(): void {
    this.#settle('idle', null);
  }

  #show(state: 'added' | 'refused', error: LinkErrorCode | null): void {
    this.#settle(state, error);
    this.#cancel = this.#deps.schedule(this.reset, noteMs);
  }

  #settle(state: RoomPasteStore['state'], error: LinkErrorCode | null): void {
    this.#cancel?.();
    this.#cancel = null;
    this.state = state;
    this.error = error;
  }
}
