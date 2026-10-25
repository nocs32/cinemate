import { feedMaxItems, type CinemaFeedEvent, type CinemaSnapshot, type CinemaViewEvent, type FeedItem } from '@cinemate/protocol';

// Clock samples kept: the best of the recent ones wins.
const maxSamples = 10;

// Puts the server's view and feed back together into the snapshots the stores read, the same shape the
// demo room sends. Playback times stay server times (the room clock turns them into this browser's);
// feed times become this browser's, for "18:05" in the chat: each view carries the server's clock, and
// a slow trip only makes a sample smaller, so the largest recent one is the closest.
export class LiveRoomView {
  #view: Omit<CinemaViewEvent, 'now'> | null = null;
  #feed: FeedItem[] = [];
  #samples: number[] = [];
  readonly #now: () => number;
  readonly #emit: (snapshot: CinemaSnapshot) => void;

  constructor(now: () => number, emit: (snapshot: CinemaSnapshot) => void) {
    this.#now = now;
    this.#emit = emit;
  }

  view({ now, ...view }: CinemaViewEvent): void {
    this.#samples = [...this.#samples, now - this.#now()].slice(-maxSamples);
    this.#view = view;
    this.#send();
  }

  feed({ reset, items }: CinemaFeedEvent): void {
    this.#feed = (reset ? items : [...this.#feed, ...items]).slice(-feedMaxItems);
    this.#send();
  }

  // How far the server's clock is ahead of ours.
  get #offset(): number {
    return this.#samples.length > 0 ? Math.max(...this.#samples) : 0;
  }

  #send(): void {
    if (!this.#view) return;

    const offset = this.#offset;

    this.#emit({ ...this.#view, feed: this.#feed.map((item) => ({ ...item, at: item.at - offset })) });
  }
}
