import { feedMaxItems, type FeedEvent, type FeedItem } from '@cinemate/protocol';
import type { DemoDeps, DemoMember } from './types';

// The chat and system lines. Everyone sees every line: nothing in a room is secret.
export class DemoFeed {
  items: FeedItem[] = [];
  readonly #deps: DemoDeps;

  constructor(deps: DemoDeps) {
    this.#deps = deps;
  }

  system(author: DemoMember, event: FeedEvent): void {
    this.#add({ ...this.#base(author), kind: 'system', event });
  }

  message(author: DemoMember, text: string): void {
    this.#add({ ...this.#base(author), kind: 'message', text });
  }

  #base(author: DemoMember): Pick<FeedItem, 'id' | 'authorId' | 'authorName' | 'authorColor' | 'at'> {
    return { id: this.#deps.createId(), authorId: author.id, authorName: author.name, authorColor: author.color, at: this.#deps.now() };
  }

  #add(item: FeedItem): void {
    this.items = [...this.items, item].slice(-feedMaxItems);
  }
}
