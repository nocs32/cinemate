import { chatMaxLength, type FeedEvent, type FeedItem } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import { formatClock } from '../../utils';
import type { Localizer, Translate } from '../locale';
import type { RoomPresenceStore } from './presence';
import type { ViewerColor } from './types';

export interface FeedEntry {
  id: string;
  kind: FeedItem['kind'];
  text: string;
  authorName: string;
  authorColor: ViewerColor;
  timeLabel: string;
  // A wait or a video that couldn't play: shown in the lamp's colour.
  isWarning: boolean;
}

export interface RoomFeedDeps {
  presence: RoomPresenceStore;
  locale: Localizer;
  send: (text: string) => void;
  // Takes a slot for one line; false when you're chatting faster than the room takes lines.
  takeTurn: () => boolean;
  // Lines that arrive while the chat is open are read at once.
  isOpen: () => boolean;
}

const titleOr = (title: string, t: Translate): string => title || t('feed.untitled');

const describePlayback = (event: FeedEvent, t: Translate): string | null => {
  switch (event.type) {
    case 'played':
    case 'paused':
    case 'seeked':
      return t(`feed.${event.type}`, { at: formatClock(event.at) });
    case 'added':
    case 'removed':
    case 'skipped':
      return t(`feed.${event.type}`, { title: titleOr(event.title, t) });
    default:
      return null;
  }
};

const describe = (event: FeedEvent, t: Translate): string => {
  switch (event.type) {
    case 'renamed':
      return t('feed.renamed', { name: event.name });
    case 'waiting':
      return t('feed.waiting', { reason: t(`feed.reasons.${event.status}`) });
    case 'wentOnWithout':
      return t('feed.wentOnWithout', { names: event.names.join(', ') });
    case 'failed':
      return t('feed.failed', { title: titleOr(event.title, t), reason: t(`feed.failure.${event.code}`) });
    case 'joined':
    case 'left':
      return t(`feed.${event.type}`);
    default:
      return describePlayback(event, t) ?? '';
  }
};

// Chat messages and what happened in the room, newest last, the composer draft, and how many
// messages came in while the chat was closed (the badge on the Chat tab).
export class RoomFeedStore {
  items: FeedItem[] = [];
  draft = '';
  // The newest line already read; null before the first lines arrive.
  readUpTo: string | null = null;
  readonly #deps: RoomFeedDeps;

  constructor(deps: RoomFeedDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get entries(): FeedEntry[] {
    return this.items.map((item) => this.#toEntry(item));
  }

  // Other people's messages since the chat was last open.
  get unreadCount(): number {
    const from = this.items.findIndex((item) => item.id === this.readUpTo) + 1;

    return this.items.slice(from).filter((item) => item.kind === 'message' && item.authorId !== this.#deps.presence.meId).length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get unreadLabel(): string {
    return this.unreadCount > 9 ? '9+' : String(this.unreadCount);
  }

  get hasUnread(): boolean {
    return this.unreadCount > 0;
  }

  get canSend(): boolean {
    return this.draft.trim().length > 0;
  }

  get maxLength(): number {
    return chatMaxLength;
  }

  // What was here before you arrived isn't unread.
  receive(items: FeedItem[]): void {
    const isFirst = this.readUpTo === null;

    this.items = items;

    if (isFirst || this.#deps.isOpen()) this.markRead();
  }

  markRead(): void {
    this.readUpTo = this.items.at(-1)?.id ?? this.readUpTo;
  }

  setDraft(draft: string): void {
    this.draft = draft.slice(0, chatMaxLength);
  }

  // The message shows once the room has added it to the feed. Too fast, and it stays in the box.
  send(): void {
    const text = this.draft.trim();

    if (!text || !this.#deps.takeTurn()) return;

    this.#deps.send(text);
    this.draft = '';
  }

  #toEntry(item: FeedItem): FeedEntry {
    const { locale, presence } = this.#deps;
    // Someone still in the room shows as they are right now; someone who left, as the line kept them.
    const author = presence.find(item.authorId);
    // A rename keeps the name they had: "Anna is now Anna K".
    const isRename = item.kind === 'system' && item.event.type === 'renamed';
    const authorName = isRename ? item.authorName : (author?.name ?? item.authorName);
    const isWarning = item.kind === 'system' && (item.event.type === 'waiting' || item.event.type === 'failed');

    return {
      id: item.id,
      kind: item.kind,
      text: item.kind === 'message' ? item.text : describe(item.event, locale.t),
      authorName: authorName || locale.t('chat.someone'),
      authorColor: author?.color ?? item.authorColor,
      timeLabel: locale.formatTime(item.at),
      isWarning,
    };
  }
}
