import { queueLimits, type MediaSource, type QueueAuthor, type QueueItem } from '@cinemate/protocol';
import { thumbnailFor } from '../links.js';
import { CinemaRuleError } from './rule-error.js';

export interface CinemaQueueDeps {
  createId: () => string;
}

// What a browser learned about a video by loading it.
export interface QueueItemDetails {
  duration: number | null;
  title: string | null;
}

// The queue and what already played tonight (spec §6). Anyone adds, reorders and removes; the next
// video is taken from the front.
export class CinemaQueue {
  items: QueueItem[] = [];
  history: QueueItem[] = [];
  readonly #deps: CinemaQueueDeps;

  constructor(deps: CinemaQueueDeps) {
    this.#deps = deps;
  }

  get next(): QueueItem | undefined {
    return this.items[0];
  }

  add(source: MediaSource, title: string | null, addedBy: QueueAuthor, duration: number | null = null): QueueItem {
    if (this.items.length >= queueLimits.maxItems) throw new CinemaRuleError('QUEUE_FULL');

    const item: QueueItem = { id: this.#deps.createId(), source, title, thumbnail: thumbnailFor(source), duration, addedBy };

    this.items = [...this.items, item];

    return item;
  }

  remove(itemId: string): QueueItem {
    const item = this.#find(itemId);

    this.items = this.items.filter((other) => other.id !== itemId);

    return item;
  }

  move(itemId: string, toIndex: number): void {
    const item = this.#find(itemId);
    const rest = this.items.filter((other) => other.id !== itemId);
    const index = Math.min(toIndex, rest.length);

    this.items = [...rest.slice(0, index), item, ...rest.slice(index)];
  }

  // A played video back at the end of the queue, as a new item added by whoever asked.
  replay(itemId: string, addedBy: QueueAuthor): QueueItem {
    const played = this.history.find((item) => item.id === itemId);

    if (!played) throw new CinemaRuleError('NO_SUCH_ITEM');

    return this.add(played.source, played.title, addedBy, played.duration);
  }

  takeNext(): QueueItem | undefined {
    const [next, ...rest] = this.items;

    this.items = rest;

    return next;
  }

  played(item: QueueItem): void {
    this.history = [item, ...this.history.filter((other) => other.id !== item.id)].slice(0, queueLimits.historyItems);
  }

  // Fills in what's still unknown about a video, wherever it is; returns the item as it is now.
  describe(item: QueueItem, details: QueueItemDetails): QueueItem {
    const described = { ...item, duration: item.duration ?? details.duration, title: item.title ?? details.title };
    const update = (other: QueueItem): QueueItem => (other.id === item.id ? described : other);

    this.items = this.items.map(update);
    this.history = this.history.map(update);

    return described;
  }

  find(itemId: string): QueueItem | undefined {
    return this.items.find((item) => item.id === itemId) ?? this.history.find((item) => item.id === itemId);
  }

  #find(itemId: string): QueueItem {
    const item = this.items.find((other) => other.id === itemId);

    if (!item) throw new CinemaRuleError('NO_SUCH_ITEM');

    return item;
  }
}
