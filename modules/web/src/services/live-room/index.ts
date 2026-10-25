import { Client, ErrorCode, type Room } from '@colyseus/sdk';
import { cinemaProtocolVersion, cinemaRoomName, type CinemaEvents, type CinemaJoinOptions } from '@cinemate/protocol';
import type { CinemaClientService, CinemaLink, CinemaLinkListeners, CinemaOpenFailure } from '../types';
import { readSeat, writeSeat } from './seat';
import { LiveRoomView } from './view';

// Vite (and later the production host) forwards /live to core-api's Colyseus server.
const livePath = '/live';

const failureOf = (error: unknown): CinemaOpenFailure => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  const message = error instanceof Error ? error.message : '';

  if (message === 'PROTOCOL_MISMATCH') return 'outdated';

  if (code === ErrorCode.MATCHMAKE_INVALID_ROOM_ID) return message.includes('locked') ? 'full' : 'gone';

  return 'unreachable';
};

// Back into the seat this tab had, if the server still holds it; otherwise a fresh join.
const enter = async (client: Client, roomId: string | null, options: CinemaJoinOptions): Promise<Room> => {
  if (roomId === null) return client.create(cinemaRoomName, options);

  const seat = readSeat(roomId);

  if (seat !== null) {
    try {
      return await client.reconnect(seat);
    } catch {
      writeSeat(roomId, null);
    }
  }

  return client.joinById(roomId, options);
};

// Every server event goes to the stores in the shape they know, the same as the demo room's.
const listenToEvents = (room: Room, listeners: CinemaLinkListeners, now: () => number): void => {
  const view = new LiveRoomView(now, listeners.snapshot);
  const on = <K extends keyof CinemaEvents>(type: K, handle: (message: CinemaEvents[K]) => void): void => void room.onMessage(type, handle);

  on('view', (message) => view.view(message));
  on('feed', (message) => view.feed(message));
  on('pong', listeners.pong);
  on('reaction', listeners.reaction);
  on('shareKey', listeners.shareKey);
  on('error', listeners.refused);
};

// Once listening, the browser asks for everything with `sync`, and again after each reconnect.
const listen = (room: Room, listeners: CinemaLinkListeners, now: () => number): void => {
  listenToEvents(room, listeners, now);
  room.onDrop(() => listeners.connection('reconnecting'));

  // The SDK calls this before it stores the new seat token, so the token is saved a moment later
  // (otherwise a reload after a reconnect would lose the seat).
  room.onReconnect(() => {
    window.setTimeout(() => writeSeat(room.roomId, room.reconnectionToken), 0);
    room.send('sync', {});
    listeners.connection('live');
  });

  // The seat is lost, or the SDK gave up reconnecting. The saved seat stays: coming back tries it
  // first, while the room still holds it.
  room.onLeave(() => listeners.closed());
  room.send('sync', {});
};

const toLink = (room: Room): CinemaLink => ({
  roomId: room.roomId,
  meId: room.sessionId,
  demo: null,
  send: (type, message) => room.send(type, message),
  close: () => void room.leave(),
});

// Live rooms on core-api (spec §12 M2), behind the same CinemaClientService as the demo room.
export const createLiveRoom = (origin: string, now: () => number): CinemaClientService => {
  const client = new Client(`${origin}${livePath}`);

  return {
    open: async ({ roomId, name, entered }, listeners) => {
      try {
        const room = await enter(client, roomId, { protocolVersion: cinemaProtocolVersion, name, entered });

        writeSeat(room.roomId, room.reconnectionToken);
        listen(room, listeners, now);

        return { ok: true, link: toLink(room) };
      } catch (error) {
        return { ok: false, failure: failureOf(error) };
      }
    },
  };
};
