import { expect, test } from 'vitest';
import { CinemaRoomFeed } from './feed.js';

const ana = { id: 'a', name: 'Ana', color: 'sky' } as const;

const createFeed = (maxItems = 10): CinemaRoomFeed => {
  let id = 0;

  return new CinemaRoomFeed({ now: () => 1000, createId: () => `line-${++id}`, maxItems });
};

test('chat lines are trimmed and empty ones dropped; system lines keep their event', () => {
  const feed = createFeed();

  feed.message(ana, '  hello there  ');
  feed.message(ana, '   ');
  feed.system(ana, { type: 'joined' });

  expect(feed.items).toEqual([
    { id: 'line-1', authorId: 'a', authorName: 'Ana', authorColor: 'sky', at: 1000, kind: 'message', text: 'hello there' },
    { id: 'line-2', authorId: 'a', authorName: 'Ana', authorColor: 'sky', at: 1000, kind: 'system', event: { type: 'joined' } },
  ]);
});

test('since gives only the lines after a sequence number', () => {
  const feed = createFeed();

  feed.message(ana, 'one');
  const seen = feed.seq;

  feed.message(ana, 'two');

  expect(feed.since(seen).map((item) => (item.kind === 'message' ? item.text : ''))).toEqual(['two']);
  expect(feed.since(feed.seq)).toEqual([]);
});

test('the oldest lines go once the feed is full', () => {
  const feed = createFeed(2);

  ['one', 'two', 'three'].forEach((text) => feed.message(ana, text));

  expect(feed.items.map((item) => (item.kind === 'message' ? item.text : ''))).toEqual(['two', 'three']);
});
