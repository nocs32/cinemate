import type { CinemaEvents } from '@cinemate/protocol';
import type { CinemaRoomFeed } from './feed.js';
import type { CinemaRoomView } from './view.js';

type CinemaRoomOutboxSend = <K extends keyof CinemaEvents>(memberId: string, type: K, message: CinemaEvents[K]) => void;

export interface CinemaRoomOutboxDeps {
  feed: CinemaRoomFeed;
  view: () => CinemaRoomView;
  now: () => number;
  send: CinemaRoomOutboxSend;
}

// What one browser has been sent so far.
interface CinemaRoomOutboxSeen {
  feedSeq: number;
  view: string;
}

// What goes out after every change (spec §10.4), to each browser that has asked with `sync` (so it's
// listening by then): the room's view when it changed, then the feed lines it hasn't had. The view
// is the same for everyone, so it's written out once per flush.
export class CinemaRoomOutbox {
  readonly #seen = new Map<string, CinemaRoomOutboxSeen>();
  readonly #deps: CinemaRoomOutboxDeps;

  constructor(deps: CinemaRoomOutboxDeps) {
    this.#deps = deps;
  }

  // Everything again, for a browser that just joined or reconnected.
  sync(memberId: string): void {
    const { feed, send, now } = this.#deps;
    const view = this.#deps.view();

    send(memberId, 'view', { now: now(), ...view });
    send(memberId, 'feed', { reset: true, items: feed.items });
    this.#seen.set(memberId, { feedSeq: feed.seq, view: JSON.stringify(view) });
  }

  // Their connection dropped or they left: nothing until they sync again.
  forget(memberId: string): void {
    this.#seen.delete(memberId);
  }

  flush(): void {
    if (this.#seen.size === 0) return;

    const view = this.#deps.view();
    const text = JSON.stringify(view);

    this.#seen.forEach((seen, memberId) => this.#flushTo(memberId, seen, view, text));
  }

  dispose(): void {
    this.#seen.clear();
  }

  #flushTo(memberId: string, seen: CinemaRoomOutboxSeen, view: CinemaRoomView, text: string): void {
    const { feed, send, now } = this.#deps;
    const items = feed.since(seen.feedSeq);

    if (text !== seen.view) send(memberId, 'view', { now: now(), ...view });

    if (items.length > 0) send(memberId, 'feed', { reset: false, items });

    this.#seen.set(memberId, { feedSeq: feed.seq, view: text });
  }
}
