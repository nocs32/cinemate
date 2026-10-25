import { Server } from '@colyseus/core';
import type { Room as SdkRoom } from '@colyseus/sdk';
import { ColyseusTestServer } from '@colyseus/testing';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { cinemaProtocolVersion, cinemaRoomName, type CinemaEvents, type CinemaIntents, type CinemaIntentType, type CinemaJoinOptions, type PlayerState } from '@cinemate/protocol';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { CinemaRoom } from './index.js';

// A real room on a real server, for the room tests: on its own port, away from the dev servers
// (2567–2573) and the siblings' room tests (2591–2595), so tests run while the projects do. YouTube's
// titles come from `titles`, never the network.

export interface Logged {
  type: string;
  payload: unknown;
}

// One browser in the room, recording every message it gets.
export interface Seat {
  room: SdkRoom;
  log: Logged[];
}

export interface TestRoom {
  // Only once the server is up (in a test).
  colyseus: () => ColyseusTestServer;
}

export const useTestRoom = (port: number, titles: Record<string, string> = {}): TestRoom => {
  let colyseus: ColyseusTestServer | null = null;

  beforeAll(async () => {
    const server = new Server({ transport: new WebSocketTransport(), greet: false });

    server.define(cinemaRoomName, CinemaRoom, { lookupTitle: (id: string) => Promise.resolve(titles[id] ?? null) });
    await server.listen(port);
    colyseus = new ColyseusTestServer(server);
  });

  afterEach(async () => {
    await colyseus?.cleanup();
  });

  afterAll(async () => {
    await colyseus?.shutdown();
  });

  return {
    colyseus: () => {
      if (!colyseus) throw new Error('The test server is not up yet');

      return colyseus;
    },
  };
};

export const joinOptions = (name: string, entered = true): CinemaJoinOptions => ({ protocolVersion: cinemaProtocolVersion, name, entered });

export const listen = (room: SdkRoom): Seat => {
  const seat: Seat = { room, log: [] };

  room.onMessage('*', (type, payload) => seat.log.push({ type: String(type), payload }));
  room.send('sync', {});

  return seat;
};

export const all = <K extends keyof CinemaEvents>(seat: Seat, type: K): Array<CinemaEvents[K]> =>
  seat.log.filter((logged) => logged.type === type).map((logged) => logged.payload as CinemaEvents[K]);

export const latest = <K extends keyof CinemaEvents>(seat: Seat, type: K): CinemaEvents[K] | undefined => all(seat, type).at(-1);

export const until = async (check: () => boolean, timeoutMs = 4000): Promise<void> => {
  const started = Date.now();

  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error('Timed out waiting for the room');

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

export const send = <T extends CinemaIntentType>(seat: Seat, type: T, message: CinemaIntents[T]): void => seat.room.send(type, message);

// Everyone in the room, entered.
export const sitDown = async (room: TestRoom, names: readonly string[]): Promise<Seat[]> => {
  const { sdk } = room.colyseus();
  const first = listen(await sdk.create(cinemaRoomName, joinOptions(names[0] ?? 'Anna')));
  const joining = names.slice(1).map(async (name) => listen(await sdk.joinById(first.room.roomId, joinOptions(name))));
  const seats = [first, ...(await Promise.all(joining))];

  await until(() => seats.every((seat) => latest(seat, 'view')?.members.length === names.length));

  return seats;
};

// What a browser's player reports, where the room says it should be.
export const report = (seat: Seat, state: PlayerState, offsetSeconds = 0): void => {
  const view = latest(seat, 'view');
  const playback = view?.playback;

  if (!view || !playback) return;

  const now = Date.now();
  const position = playback.phase === 'playing' && now > playback.at ? playback.position + (now - playback.at) / 1000 : playback.position;

  send(seat, 'status', { itemId: playback.item?.id ?? null, state, position: position + offsetSeconds, sampledAt: now });
};

export const phaseOf = (seat: Seat): string | undefined => latest(seat, 'view')?.playback.phase;
