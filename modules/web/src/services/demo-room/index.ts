import { cleanPersonName, viewerColors } from '@cinemate/protocol';
import type { CinemaClientService, CinemaLink } from '../types';
import { demoQueue } from './films';
import { DemoReferee } from './referee';
import type { DemoDeps, DemoMember } from './types';

const roomIdAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

// What core-api hands out: 12 characters of [0-9a-z].
const newRoomId = (random: () => number): string =>
  Array.from({ length: 12 }, () => roomIdAlphabet[Math.floor(random() * roomIdAlphabet.length)]).join('');

const defaultName = 'Curious Fox';

// The sample viewers sit down, then Marta fills the queue a link at a time, as people would.
const seat = (referee: DemoReferee, deps: DemoDeps): void => {
  const marta = [referee.addSample(), referee.addSample(), referee.addSample()].at(-1);

  demoQueue.forEach((url, index) => deps.schedule(() => marta && referee.paste(marta.id, url), 1200 + index * 400));
  deps.schedule(() => referee.addSample(), 9000);
};

// The room without a server, for building and reviewing the UI (spec §12 M1).
export const createDemoRoom = (deps: DemoDeps): CinemaClientService => ({
  open: (request, listeners) => {
    const meId = deps.createId();
    const referee = new DemoReferee(deps, listeners);

    const link: CinemaLink = {
      roomId: request.roomId ?? newRoomId(deps.random),
      meId,
      demo: { run: (action) => referee.run(action) },
      // A moment later, as over a network: the browser never hears back in the middle of sending.
      send: (type, message) => void deps.schedule(() => referee.handle(meId, type, message), 0),
      close: () => referee.dispose(),
    };

    // After `open` resolves, so the store already knows who it is.
    deps.schedule(() => {
      const me: DemoMember = { id: meId, name: cleanPersonName(request.name ?? '') || defaultName, color: viewerColors[0], connected: true, sample: false };

      referee.join(me, request.entered);
      seat(referee, deps);
    }, 0);

    return Promise.resolve({ ok: true, link });
  },
});
