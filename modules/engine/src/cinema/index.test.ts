import { syncLimits } from '@cinemate/protocol';
import { expect, test } from 'vitest';
import { CinemaRuleError } from './index.js';
import { author, createTestCinema, film, type TestCinema } from './test-cinema.js';

// Everyone in step, a little past the start's grace.
const playingTogether = (people: string[]): TestCinema => {
  const room = createTestCinema(people);

  room.cinema.add(author(people[0] ?? 'a'), film(), 'Big Buck Bunny', room.now());
  room.ready(...people);
  room.advance(syncLimits.countdownMs + syncLimits.startupGraceMs);

  return room;
};

test('a link added to an empty room loads for everyone, then counts down and plays', () => {
  const room = createTestCinema(['anna', 'dima']);

  room.cinema.add(author('anna'), film(), 'Big Buck Bunny', room.now());

  expect(room.cinema.view().playback).toMatchObject({ phase: 'loading', reason: 'start', waitingFor: ['anna', 'dima'] });

  room.ready('anna');

  expect(room.cinema.view().playback.waitingFor).toEqual(['dima']);

  room.ready('dima');

  expect(room.cinema.view().playback).toMatchObject({ phase: 'playing', countdown: true, at: room.now() + syncLimits.countdownMs });
});

test('someone buffering makes the room wait for them, and it says who', () => {
  const room = playingTogether(['anna', 'dima']);

  room.report('dima', 'buffering');
  expect(room.cinema.view().playback.phase).toBe('playing');

  room.report('dima', 'buffering');
  expect(room.cinema.view().playback).toMatchObject({ phase: 'loading', reason: 'catchUp', resume: true });

  room.ready('anna');
  room.advance(syncLimits.slowpokeAfterMs);

  expect(room.cinema.view().playback.waitingFor).toEqual(['dima']);
  expect(room.cinema.member('dima', room.now())).toMatchObject({ status: 'buffering', slowpokes: 1 });
  expect(room.cinema.drainNotices().map((notice) => [notice.by, notice.event.type])).toContainEqual(['dima', 'waiting']);

  room.ready('dima');
  expect(room.cinema.view().playback).toMatchObject({ phase: 'playing', countdown: true });
});

test('within 300 ms nothing happens; further off, twice in a row, and the room waits', () => {
  const room = playingTogether(['anna', 'dima']);

  room.report('dima', 'playing', -250);
  room.report('dima', 'playing', -250);
  expect(room.cinema.view().playback.phase).toBe('playing');

  room.report('dima', 'playing', -400);
  expect(room.cinema.member('dima', room.now())).toMatchObject({ status: 'behind', offsetMs: -400 });

  room.report('dima', 'playing', -400);
  expect(room.cinema.view().playback).toMatchObject({ phase: 'loading', reason: 'catchUp' });
});

test('after 20 s the others may go on without the slow one, who then catches up alone', () => {
  const room = playingTogether(['anna', 'dima']);

  room.report('dima', 'stuck');
  room.report('dima', 'stuck');
  room.ready('anna');

  expect(() => room.cinema.goOnWithout('anna', room.now())).toThrow(CinemaRuleError);

  room.advance(syncLimits.goOnAfterMs);
  room.cinema.goOnWithout('anna', room.now());

  expect(room.cinema.view().playback).toMatchObject({ phase: 'playing', excused: ['dima'] });
  expect(room.cinema.member('dima', room.now())?.status).toBe('catchingUp');

  room.advance(syncLimits.countdownMs + syncLimits.startupGraceMs);
  room.report('dima', 'playing', 50);

  expect(room.cinema.view().playback.excused).toEqual([]);
});

test('someone who comes in mid-video is not waited for', () => {
  const room = playingTogether(['anna']);

  room.cinema.join('oleh', true, room.now());
  room.report('oleh', 'loading');
  room.report('oleh', 'loading');

  expect(room.cinema.view().playback.phase).toBe('playing');
  expect(room.cinema.member('oleh', room.now())?.status).toBe('catchingUp');
});

test('people still on the join card are never waited for', () => {
  const room = createTestCinema(['anna']);

  room.cinema.join('taras', false, room.now());
  room.cinema.add(author('anna'), film(), null, room.now());
  room.ready('anna');

  expect(room.cinema.view().playback.phase).toBe('playing');
  expect(room.cinema.member('taras', room.now())?.status).toBe('joining');
});

test('pause, then play starts quickly; a seek while paused stays paused', () => {
  const room = playingTogether(['anna']);

  room.advance(10_000);
  room.cinema.pause('anna', room.now());

  const { position } = room.cinema.view().playback;

  expect(room.cinema.view().playback.phase).toBe('paused');

  room.cinema.seek('anna', position + 30, room.now());
  room.ready('anna');
  expect(room.cinema.view().playback).toMatchObject({ phase: 'paused', position: position + 30 });

  room.cinema.play('anna', room.now());
  room.ready('anna');
  expect(room.cinema.view().playback).toMatchObject({ phase: 'playing', countdown: false, at: room.now() + syncLimits.quickStartMs });
});

test('the end of a video shows "Up next", then the next one starts; holding the card stops it', () => {
  const room = playingTogether(['anna']);

  room.cinema.add(author('anna'), film('R6MlUcmOul8'), 'Tears of Steel', room.now());
  room.cinema.describe(room.cinema.view().playback.item?.id ?? '', { duration: 60, title: null });
  room.advance(60_000);

  expect(room.cinema.view().playback.phase).toBe('upNext');
  expect(room.cinema.view().history.map((item) => item.title)).toEqual(['Big Buck Bunny']);

  room.cinema.holdUpNext(true, room.now());
  room.advance(syncLimits.upNextMs);
  expect(room.cinema.view().playback.phase).toBe('upNext');

  room.cinema.holdUpNext(false, room.now());
  room.advance(syncLimits.upNextMs);
  expect(room.cinema.view().playback).toMatchObject({ phase: 'loading', reason: 'start', item: { title: 'Tears of Steel' } });
});

test('a video nobody can play is skipped with a line saying why', () => {
  const room = playingTogether(['anna']);

  room.cinema.failed('anna', room.cinema.view().playback.item?.id ?? '', 'blocked', room.now());

  expect(room.cinema.view().playback.phase).toBe('ended');
  expect(room.cinema.drainNotices().at(-1)?.event).toEqual({ type: 'failed', title: 'Big Buck Bunny', code: 'blocked' });
});

test('skip goes to the next video, and the queue reorders and replays', () => {
  const room = playingTogether(['anna']);
  const { cinema } = room;
  const sintel = cinema.add(author('anna'), film('eRsGyueVLvQ'), 'Sintel', room.now());
  const spring = cinema.add(author('anna'), film('WhWc3b3KhnY'), 'Spring', room.now());

  cinema.move(spring.id, 0);
  expect(cinema.view().queue.map((item) => item.title)).toEqual(['Spring', 'Sintel']);

  cinema.skip('anna', room.now());
  expect(cinema.view().playback.item?.title).toBe('Spring');

  const replayed = cinema.replay(author('anna'), cinema.view().history[0]?.id ?? '', room.now());

  expect(cinema.view().queue.map((item) => item.title)).toEqual(['Sintel', 'Big Buck Bunny']);
  expect(replayed.id).not.toBe(sintel.id);
  expect(() => cinema.remove('anna', 'nope')).toThrow(CinemaRuleError);
});
