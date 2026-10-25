import type { CinemaIntents, CinemaIntentType, MediaErrorCode, ViewerColor } from '@cinemate/protocol';
import type { Cinema, ViewerReport } from '@cinemate/engine';

export type DemoHandlers = { [K in CinemaIntentType]: (memberId: string, message: CinemaIntents[K]) => void };

// What the referee does about the room, besides the cinema's own moves.
export interface DemoMoves {
  cinema: Cinema;
  now: () => number;
  sync: () => void;
  pong: (sentAt: number) => void;
  enter: (memberId: string, name: string, color: ViewerColor) => void;
  rename: (memberId: string, name: string) => void;
  recolor: (memberId: string, color: ViewerColor) => void;
  chat: (memberId: string, text: string) => void;
  add: (memberId: string, url: string) => void;
  replay: (memberId: string, itemId: string) => void;
  report: (memberId: string, report: ViewerReport) => void;
  failed: (memberId: string, itemId: string, code: MediaErrorCode) => void;
  startShare: (memberId: string) => void;
}

const ignore = (): void => undefined;

// Each intent and the move that answers it. Reactions matter only to other people, and in the demo
// room everyone else is a sample viewer.
export const demoHandlers = (moves: DemoMoves): DemoHandlers => {
  const { cinema, now } = moves;

  return {
    sync: () => moves.sync(),
    ping: (_id, { sentAt }) => moves.pong(sentAt),
    enter: (id, { name, color }) => moves.enter(id, name, color),
    rename: (id, { name }) => moves.rename(id, name),
    recolor: (id, { color }) => moves.recolor(id, color),
    chat: (id, { text }) => moves.chat(id, text),
    react: ignore,
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
    status: (id, report) => moves.report(id, report),
    mediaError: (id, { itemId, code }) => moves.failed(id, itemId, code),
    startShare: (id) => moves.startShare(id),
    stopShare: (id) => cinema.stopShare(id),
    watchStats: (id, { fps }) => cinema.watchStats(id, fps),
  };
};
