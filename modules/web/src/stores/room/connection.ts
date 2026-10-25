import type { CinemaErrorEvent, CinemaSnapshot } from '@cinemate/protocol';
import { makeAutoObservable, observableRef } from 'mobx';
import type { AddressService, CinemaClientService, CinemaConnectionState, CinemaLink, CinemaLinkListeners, CinemaOpenFailure, CinemaOpenResult, PreferencesService } from '../../services';
import type { Translate } from '../locale';

// idle → landing (the start page, at /) → opening → live ⇄ reconnecting. A room link skips the
// landing. Opening can end in a failure instead; a seat that's lost for good while live goes back to
// opening (a fresh join to the same room).
export type RoomConnectionState = 'idle' | 'landing' | 'opening' | 'live' | 'reconnecting' | CinemaOpenFailure;

// What the room sends that the room's parts take care of.
export type RoomConnectionReceivers = Omit<CinemaLinkListeners, 'connection' | 'closed'>;

export interface RoomConnectionDeps {
  cinemaClient: CinemaClientService;
  address: AddressService;
  preferences: PreferencesService;
  t: Translate;
  receivers: RoomConnectionReceivers;
}

const failures: readonly RoomConnectionState[] = ['gone', 'full', 'outdated', 'unreachable'];

// The link to the room: opening one, staying connected, and what to show when there's no room.
export class RoomConnectionStore {
  state: RoomConnectionState = 'idle';
  // The room's id, once known: from the address, or from the server for a new room.
  roomId: string | null = null;
  link: CinemaLink | null = null;
  // Opened from the start page: that click already let the browser play sound, so no join card.
  entered = false;
  readonly #deps: RoomConnectionDeps;

  constructor(deps: RoomConnectionDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { link: observableRef }, { autoBind: true });
  }

  // The room is on screen (also while reconnecting, with a notice).
  get isOpen(): boolean {
    return this.state === 'live' || this.state === 'reconnecting';
  }

  get isLanding(): boolean {
    return this.state === 'landing';
  }

  get isReconnecting(): boolean {
    return this.state === 'reconnecting';
  }

  get isBusy(): boolean {
    return this.state === 'idle' || this.state === 'opening';
  }

  get meId(): string {
    return this.link?.meId ?? '';
  }

  get title(): string {
    const { t } = this.#deps;

    if (this.isBusy) return this.roomId === null ? t('status.creating') : t('status.joining');

    return this.isOpen ? t('status.reconnecting') : t(`status.${this.state as CinemaOpenFailure}Title`);
  }

  get text(): string {
    return failures.includes(this.state) ? this.#deps.t(`status.${this.state as CinemaOpenFailure}Text`) : '';
  }

  // The one thing to do about a failure: start over, reload, or try again.
  get actionLabel(): string {
    const { t } = this.#deps;

    if (this.state === 'outdated') return t('status.reload');

    return this.state === 'unreachable' ? t('status.retry') : t('status.startNew');
  }

  open(): void {
    if (this.state !== 'idle') return;

    this.roomId = this.#deps.address.roomId();

    if (this.roomId === null) this.state = 'landing';
    else this.#enter();
  }

  // "Open a room" on the start page.
  create(): void {
    if (this.state !== 'landing') return;

    this.entered = true;
    this.#enter();
  }

  settle(result: CinemaOpenResult): void {
    if (this.state !== 'opening') return;

    if (!result.ok) {
      this.state = result.failure;

      return;
    }

    this.link = result.link;
    this.roomId = result.link.roomId;
    this.#deps.address.showRoom(result.link.roomId);
  }

  // The first snapshot puts the room on screen.
  receiveSnapshot(snapshot: CinemaSnapshot): void {
    this.#deps.receivers.snapshot(snapshot);

    if (this.state === 'opening' && this.link) this.state = 'live';
  }

  changeConnection(state: CinemaConnectionState): void {
    if (this.isOpen) this.state = state;
  }

  // The seat is gone (the room closed, or reconnecting took too long): sit down again if the room
  // still exists. Otherwise opening fails with 'gone'.
  close(): void {
    if (!this.isOpen) return;

    this.link = null;
    this.#enter();
  }

  refuse(event: CinemaErrorEvent): void {
    this.#deps.receivers.refused(event);
  }

  act(): void {
    if (this.state === 'outdated') this.#deps.address.reload();
    else if (this.state === 'unreachable') this.#enter();
    else if (failures.includes(this.state)) this.#deps.address.startNew();
  }

  #enter(): void {
    const { cinemaClient, preferences, receivers } = this.#deps;
    const listeners: CinemaLinkListeners = { ...receivers, snapshot: this.receiveSnapshot, connection: this.changeConnection, closed: this.close, refused: this.refuse };

    this.state = 'opening';
    void cinemaClient.open({ roomId: this.roomId, name: preferences.loadName(), entered: this.entered }, listeners).then(this.settle);
  }
}
