import { syncLimits } from '@cinemate/protocol';
import { expect, test } from 'vitest';
import { CinemaRuleError } from './index.js';
import { createTestCinema, startTogether } from './test-cinema.js';

const shareId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

const refusal = (move: () => void): string | null => {
  try {
    move();

    return null;
  } catch (error) {
    return error instanceof CinemaRuleError ? error.code : 'not a rule error';
  }
};

test('a share stops the video where it is, says so, and gives the relay a path', () => {
  const room = createTestCinema(['anna', 'dima']);

  startTogether(room, ['anna', 'dima']);
  room.advance(10_000);

  const share = room.cinema.startShare('dima', shareId, room.now());

  expect(share).toEqual({ sharerId: 'dima', path: `live/${shareId}`, since: room.now() });
  expect(room.cinema.view()).toMatchObject({ share, playback: { phase: 'paused' } });
  expect(room.cinema.view().playback.position).toBeGreaterThan(10);
  expect(room.cinema.drainNotices().map((notice) => notice.event.type)).toContain('shareStarted');
});

test('one share at a time: someone else is refused, the sharer may start again', () => {
  const room = createTestCinema(['anna', 'dima']);

  room.cinema.startShare('anna', shareId, room.now());

  expect(refusal(() => room.cinema.startShare('dima', shareId, room.now()))).toBe('SHARE_TAKEN');
  expect(refusal(() => room.cinema.startShare('anna', shareId, room.now()))).toBeNull();
  expect(refusal(() => room.cinema.stopShare('dima'))).toBe('NOT_SHARING');
});

test('while someone shares, playback moves are refused and nobody is waited for', () => {
  const room = createTestCinema(['anna', 'dima']);

  startTogether(room, ['anna', 'dima']);
  room.cinema.startShare('anna', shareId, room.now());

  expect(refusal(() => room.cinema.play('dima', room.now()))).toBe('SHARE_ON');
  expect(refusal(() => room.cinema.seek('dima', 30, room.now()))).toBe('SHARE_ON');
  expect(refusal(() => room.cinema.skip('dima', room.now()))).toBe('SHARE_ON');

  room.report('dima', 'buffering');
  room.advance(syncLimits.goOnAfterMs);

  expect(room.cinema.view().playback.phase).toBe('paused');
});

test('stopping, or the sharer leaving, ends the share and the queue is back, paused', () => {
  const room = createTestCinema(['anna', 'dima']);

  startTogether(room, ['anna', 'dima']);
  room.cinema.startShare('anna', shareId, room.now());
  room.cinema.watchStats('dima', 59.6);

  expect(room.cinema.member('dima', room.now())?.watchFps).toBe(60);

  room.cinema.stopShare('anna');

  expect(room.cinema.view().share).toBeNull();
  expect(room.cinema.member('dima', room.now())?.watchFps).toBeNull();
  expect(refusal(() => room.cinema.play('dima', room.now()))).toBeNull();

  room.cinema.startShare('dima', shareId, room.now());
  room.cinema.leave('dima', room.now());

  expect(room.cinema.view().share).toBeNull();
});
