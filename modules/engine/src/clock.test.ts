import { expect, test } from 'vitest';
import { clockOffset } from './clock.js';

test('the fastest round trip sets the offset', () => {
  // The server is 5000 ms ahead. The slow sample's server time landed late in its trip.
  const samples = [
    { sentAt: 1000, serverNow: 6400, receivedAt: 1600 },
    { sentAt: 2000, serverNow: 7020, receivedAt: 2040 },
    { sentAt: 3000, serverNow: 8100, receivedAt: 3200 },
  ];

  expect(clockOffset(samples)).toBe(5000);
});

test('no samples, no offset; a sample that came back before it left is ignored', () => {
  expect(clockOffset([])).toBeNull();
  expect(clockOffset([{ sentAt: 2000, serverNow: 9000, receivedAt: 1000 }])).toBeNull();
});
