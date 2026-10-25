import type { Cinema } from '@cinemate/engine';
import type { CinemaIntents, CinemaIntentType, MediaErrorCode, ViewerColor } from '@cinemate/protocol';

export type CinemaRoomHandlers = { [K in CinemaIntentType]: (memberId: string, message: CinemaIntents[K]) => void };

// What the room does about an intent, besides the cinema's own moves.
export interface CinemaRoomMoves {
  cinema: Cinema;
  now: () => number;
  sync: (memberId: string) => void;
  pong: (memberId: string, sentAt: number) => void;
  enter: (memberId: string, name: string, color: ViewerColor) => void;
  rename: (memberId: string, name: string) => void;
  recolor: (memberId: string, color: ViewerColor) => void;
  chat: (memberId: string, text: string) => void;
  react: (memberId: string, emoji: string) => void;
  add: (memberId: string, url: string) => void;
  replay: (memberId: string, itemId: string) => void;
  failed: (memberId: string, itemId: string, code: MediaErrorCode) => void;
  startShare: (memberId: string) => void;
}

// Each intent and the one call that answers it (core-api rule 3).
export const cinemaRoomHandlers = (moves: CinemaRoomMoves): CinemaRoomHandlers => {
  const { cinema, now } = moves;

  return {
    sync: (id) => moves.sync(id),
    ping: (id, { sentAt }) => moves.pong(id, sentAt),
    enter: (id, { name, color }) => moves.enter(id, name, color),
    rename: (id, { name }) => moves.rename(id, name),
    recolor: (id, { color }) => moves.recolor(id, color),
    chat: (id, { text }) => moves.chat(id, text),
    react: (id, { emoji }) => moves.react(id, emoji),
    add: (id, { url }) => moves.add(id, url),
    remove: (id, { itemId }) => cinema.remove(id, itemId, now()),
    move: (_id, { itemId, toIndex }) => cinema.move(itemId, toIndex),
    replay: (id, { itemId }) => moves.replay(id, itemId),
    describe: (_id, { itemId, duration, title }) => cinema.describe(itemId, { duration: duration > 0 ? duration : null, title }),
    play: (id) => cinema.play(id, now()),
    pause: (id) => cinema.pause(id, now()),
    seek: (id, { position }) => cinema.seek(id, position, now()),
    skip: (id) => cinema.skip(id, now()),
    goOnWithout: (id) => cinema.goOnWithout(id, now()),
    holdUpNext: (_id, { held }) => cinema.holdUpNext(held, now()),
    status: (id, report) => cinema.report(id, report, now()),
    mediaError: (id, { itemId, code }) => moves.failed(id, itemId, code),
    startShare: (id) => moves.startShare(id),
    stopShare: (id) => cinema.stopShare(id),
    watchStats: (id, { fps }) => cinema.watchStats(id, fps),
  };
};
