import type { MediaKind, QueueItem } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import { formatClock } from '../../utils';
import type { Translate } from '../locale';
import type { RoomPresenceStore } from './presence';
import type { CinemaSend, ViewerColor } from './types';

// A queue item as a ticket (spec §6): its place in line, thumbnail, title, length and who added it.
export interface TicketView {
  id: string;
  position: string;
  title: string;
  thumbnail: string | null;
  kind: MediaKind;
  lengthLabel: string;
  addedByName: string;
  addedByColor: ViewerColor;
  isNext: boolean;
  isDragged: boolean;
}

export interface RoomQueueDeps {
  t: Translate;
  presence: RoomPresenceStore;
  send: CinemaSend;
}

// A title for a video the room doesn't have one for yet.
export const titleOf = (item: QueueItem, t: Translate): string => item.title ?? t(`now.untitled.${item.source.kind}`);

// The queue and tonight's history, as tickets. Reordering is a drag: idle → dragging → (drop) idle.
export class RoomQueueStore {
  items: QueueItem[] = [];
  history: QueueItem[] = [];
  dragged: string | null = null;
  readonly #deps: RoomQueueDeps;

  constructor(deps: RoomQueueDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get tickets(): TicketView[] {
    return this.items.map((item, index) => this.#toTicket(item, String(index + 1), index === 0));
  }

  get played(): TicketView[] {
    return this.history.map((item) => this.#toTicket(item, '✓', false));
  }

  get next(): QueueItem | undefined {
    return this.items[0];
  }

  get countLabel(): string {
    return String(this.items.length);
  }

  get playedLabel(): string {
    return String(this.history.length);
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get hasPlayed(): boolean {
    return this.history.length > 0;
  }

  receive(items: QueueItem[], history: QueueItem[]): void {
    this.items = items;
    this.history = history;
  }

  remove(itemId: string): void {
    this.#deps.send('remove', { itemId });
  }

  replay(itemId: string): void {
    this.#deps.send('replay', { itemId });
  }

  startDrag(itemId: string): void {
    this.dragged = itemId;
  }

  // Dropped on the ticket at `index`: it takes that place, and the rest move along.
  dropAt(index: number): void {
    const itemId = this.dragged;

    this.dragged = null;

    if (!itemId || this.items.findIndex((item) => item.id === itemId) === index) return;

    this.items = this.#moved(itemId, index);
    this.#deps.send('move', { itemId, toIndex: index });
  }

  endDrag(): void {
    this.dragged = null;
  }

  #moved(itemId: string, index: number): QueueItem[] {
    const item = this.items.find((other) => other.id === itemId);
    const rest = this.items.filter((other) => other.id !== itemId);

    return item ? [...rest.slice(0, index), item, ...rest.slice(index)] : this.items;
  }

  #toTicket(item: QueueItem, position: string, isNext: boolean): TicketView {
    const { t, presence } = this.#deps;
    const author = presence.find(item.addedBy.id);

    return {
      id: item.id,
      position,
      title: titleOf(item, t),
      thumbnail: item.thumbnail,
      kind: item.source.kind,
      lengthLabel: item.duration === null ? t(`now.kind.${item.source.kind}`) : formatClock(item.duration),
      addedByName: author?.name ?? item.addedBy.name,
      addedByColor: author?.color ?? item.addedBy.color,
      isNext,
      isDragged: this.dragged === item.id,
    };
  }
}
