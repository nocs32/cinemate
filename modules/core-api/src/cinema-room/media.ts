import type { ShareSnapshot } from '@cinemate/protocol';
import type { MediaShares } from '../media/index.js';

export interface CinemaRoomMediaDeps {
  shares: () => MediaShares;
  roomId: () => string;
}

// The room's share on the relay's list (spec §14.3): opened with a fresh key when someone starts
// sharing, and closed the moment the cinema's share ends (stopped, the sharer left, a new share
// replaced it, the room closed), so a stale key never lets anyone in.
export class CinemaRoomMedia {
  readonly #deps: CinemaRoomMediaDeps;
  #path: string | null = null;

  constructor(deps: CinemaRoomMediaDeps) {
    this.#deps = deps;
  }

  // The key for the sharer's browser.
  open(share: ShareSnapshot): string {
    this.sync(null);
    this.#path = share.path;

    return this.#deps.shares().open(share.path, this.#deps.roomId());
  }

  // After every change: a share the cinema no longer has comes off the list.
  sync(share: ShareSnapshot | null): void {
    if (this.#path === null || this.#path === share?.path) return;

    this.#deps.shares().close(this.#path);
    this.#path = null;
  }

  dispose(): void {
    this.sync(null);
  }
}
