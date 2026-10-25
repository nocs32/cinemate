import { expect, test } from 'vitest';
import { MediaShares } from './shares.js';

const path = 'live/7c9e6679-7425-40de-944b-e07fc1f90ae7';

test('the relay lets in watchers of an open share, and only its key publishes', () => {
  const shares = new MediaShares();
  const key = shares.open(path, 'room1');

  expect(shares.allows({ action: 'read', path, token: '' })).toBe(true);
  expect(shares.allows({ action: 'publish', path, token: key })).toBe(true);
  expect(shares.allows({ action: 'publish', path, token: `${key}x` })).toBe(false);
  expect(shares.allows({ action: 'playback', path, token: key })).toBe(false);
});

test('paths that were never opened, or are closed, or are not share paths, let nobody in', () => {
  const shares = new MediaShares();
  const key = shares.open(path, 'room1');

  expect(shares.allows({ action: 'read', path: 'spike', token: '' })).toBe(false);
  expect(shares.allows({ action: 'read', path: 'live/7c9e6679-7425-40de-944b-e07fc1f90ae8', token: '' })).toBe(false);

  shares.close(path);

  expect(shares.allows({ action: 'publish', path, token: key })).toBe(false);
});
