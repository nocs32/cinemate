import type { AddressService } from './types';

const roomPath = /^\/r\/([0-9a-z]{12})\/?$/u;

// The room's address is /r/:roomId; `/` is the start page, and a new room's address replaces it.
export const createAddress = (): AddressService => ({
  roomId: () => roomPath.exec(window.location.pathname)?.[1] ?? null,
  showRoom: (roomId) => {
    const path = `/r/${roomId}`;

    if (window.location.pathname !== path) window.history.replaceState(null, '', path);
  },
  startNew: () => window.location.assign('/'),
  reload: () => window.location.reload(),
});
