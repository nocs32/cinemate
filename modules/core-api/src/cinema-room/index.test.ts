import { syncLimits, viewerColors } from '@cinemate/protocol';
import { expect, test } from 'vitest';
import { all, latest, phaseOf, report, send, sitDown, until, useTestRoom, type Seat } from './test-room.js';

const room = useTestRoom(2596, { 'aqz-KE-bpKQ': 'Big Buck Bunny' });

const film = 'https://example.com/films/sintel.mp4';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Everyone reports ready where the room waits, until the room moves on.
const readyAll = async (seats: Seat[], phase: string): Promise<void> => {
  await until(() => {
    seats.forEach((seat) => report(seat, 'ready'));

    return seats.every((seat) => phaseOf(seat) === phase);
  });
};

test('a link loads paused for everyone; play starts them together at the same moment', async () => {
  const seats = await sitDown(room, ['Anna', 'Dima']);
  const [anna, dima] = seats as [Seat, Seat];

  send(anna, 'add', { url: film });
  await until(() => phaseOf(dima) === 'loading');
  await readyAll(seats, 'paused');

  send(dima, 'play', {});
  await readyAll(seats, 'playing');

  const [a, d] = seats.map((seat) => latest(seat, 'view')?.playback);

  expect(a?.at).toBe(d?.at);
  expect(a?.item?.title).toBe('sintel.mp4');
  expect(all(anna, 'feed').flatMap((event) => event.items).map((item) => (item.kind === 'system' ? item.event.type : item.text))).toContain('played');
});

test('someone buffering makes the room wait for them, by name', async () => {
  const seats = await sitDown(room, ['Anna', 'Dima']);
  const [anna, dima] = seats as [Seat, Seat];

  send(anna, 'add', { url: film });
  await until(() => phaseOf(dima) === 'loading');
  await readyAll(seats, 'paused');
  send(anna, 'play', {});
  await readyAll(seats, 'playing');
  await sleep(syncLimits.quickStartMs + syncLimits.startupGraceMs + 400);

  report(dima, 'buffering');
  report(dima, 'buffering');
  await until(() => latest(anna, 'view')?.playback.reason === 'catchUp');

  // Anna's player gets ready where the room stopped; Dima's is still buffering.
  await until(() => {
    report(anna, 'ready');
    report(dima, 'buffering');

    return latest(anna, 'view')?.playback.waitingFor.length === 1;
  });

  expect(latest(anna, 'view')?.playback.waitingFor).toEqual([dima.room.sessionId]);
  expect(latest(anna, 'view')?.members.find((member) => member.name === 'Dima')?.status).toBe('buffering');
});

test('a YouTube link gets its title from YouTube; junk links are refused with a reason', async () => {
  const [anna] = (await sitDown(room, ['Anna'])) as [Seat];

  send(anna, 'add', { url: 'https://youtu.be/aqz-KE-bpKQ' });
  await until(() => latest(anna, 'view')?.playback.item?.title === 'Big Buck Bunny');

  send(anna, 'add', { url: 'http://example.com/a.mp4' });
  send(anna, 'add', { url: 'not a link' });
  await until(() => all(anna, 'error').length === 2);

  expect(all(anna, 'error').map((error) => error.code)).toEqual(['NOT_HTTPS', 'NOT_A_LINK']);
});

test('the clock answers pings, and names and colours change for everyone', async () => {
  const seats = await sitDown(room, ['Anna', 'Dima']);
  const [anna, dima] = seats as [Seat, Seat];

  send(anna, 'ping', { sentAt: 123 });
  await until(() => latest(anna, 'pong') !== undefined);
  expect(latest(anna, 'pong')?.sentAt).toBe(123);

  send(anna, 'rename', { name: 'Anna K' });
  send(anna, 'recolor', { color: 'orange' });
  await until(() => latest(dima, 'view')?.members.some((member) => member.name === 'Anna K' && member.color === 'orange') ?? false);

  const dimaColor = latest(dima, 'view')?.members.find((member) => member.name === 'Dima')?.color;

  send(anna, 'recolor', { color: dimaColor ?? 'teal' });
  await until(() => all(anna, 'error').length === 1);
  expect(latest(anna, 'error')?.code).toBe('COLOR_TAKEN');
});

test('someone still on the join card is never waited for, and enters with their name and colour', async () => {
  const { sdk } = room.colyseus();
  const [anna] = (await sitDown(room, ['Anna'])) as [Seat];
  const { joinOptions, listen } = await import('./test-room.js');
  const taras = listen(await sdk.joinById(anna.room.roomId, joinOptions('Taras', false)));

  send(anna, 'add', { url: film });
  await until(() => phaseOf(anna) === 'loading');
  await readyAll([anna], 'paused');

  expect(latest(anna, 'view')?.members.find((member) => member.name === 'Taras')?.status).toBe('joining');

  const worn = new Set(latest(anna, 'view')?.members.map((member) => member.color));
  const free = viewerColors.find((color) => !worn.has(color)) ?? 'silver';

  send(taras, 'enter', { name: 'Taras', color: free });
  await until(() => latest(anna, 'view')?.members.find((member) => member.name === 'Taras')?.entered === true);
});
