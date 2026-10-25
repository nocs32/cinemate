import { syncLimits, type MediaSource, type PlayerState, type QueueAuthor } from '@cinemate/protocol';
import { Cinema } from './index.js';

// A cinema on a hand-moved clock, with helpers that report for a viewer like their browser would.
export interface TestCinema {
  cinema: Cinema;
  now: () => number;
  advance: (ms: number) => void;
  // A report of `state` at the room's expected position, plus `offsetMs`.
  report: (id: string, state: PlayerState, offsetMs?: number) => void;
  // Everyone listed reports ready where the room waits.
  ready: (...ids: string[]) => void;
}

// A video playing for everyone, a little past the start's grace: added (it loads paused), played,
// and everyone ready both times.
export const startTogether = (room: TestCinema, people: readonly string[]): void => {
  room.cinema.add(author(people[0] ?? 'a'), film(), 'Big Buck Bunny', room.now());
  room.ready(...people);
  room.cinema.play(people[0] ?? 'a', room.now());
  room.ready(...people);
  room.advance(syncLimits.quickStartMs + syncLimits.startupGraceMs);
};

export const author = (id: string): QueueAuthor => ({ id, name: id.toUpperCase(), color: 'teal' });

export const film = (ref = 'aqz-KE-bpKQ'): MediaSource => ({ kind: 'youtube', ref, start: 0 });

export const createTestCinema = (people: readonly string[]): TestCinema => {
  let now = 1_000_000;
  let id = 0;
  const cinema = new Cinema({ createId: () => `item-${++id}`, nameOf: (memberId) => memberId.toUpperCase() });

  people.forEach((person) => cinema.join(person, true, now));

  const report = (who: string, state: PlayerState, offsetMs = 0): void => {
    const { playback } = cinema;
    const position = playback.phase === 'playing' && now > playback.at ? playback.position + (now - playback.at) / 1000 : playback.position;

    cinema.report(who, { itemId: playback.item?.id ?? null, state, position: position + offsetMs / 1000, sampledAt: now }, now);
  };

  return {
    cinema,
    now: () => now,
    advance: (ms) => {
      now += ms;
      cinema.tick(now);
    },
    report,
    ready: (...ids) => ids.forEach((who) => report(who, 'ready')),
  };
};
