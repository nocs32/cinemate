import { randomBytes, timingSafeEqual } from 'node:crypto';
import { liveMediaPathPattern, type MediaAccess } from '@cinemate/protocol';

interface MediaShare {
  roomId: string;
  key: string;
}

const sameKey = (given: string, key: string): boolean => {
  const a = Buffer.from(given);
  const b = Buffer.from(key);

  return a.length === b.length && timingSafeEqual(a, b);
};

// Every share running in any room, by its relay path. A room opens one when someone starts sharing
// and closes it when the share ends, so the relay only ever takes a stream (with its key) or hands one
// out on a path a room is using right now. One for the whole server, made in the composition root.
export class MediaShares {
  readonly #shares = new Map<string, MediaShare>();

  // The key the sharer's browser publishes with.
  open(path: string, roomId: string): string {
    const key = randomBytes(24).toString('base64url');

    this.#shares.set(path, { roomId, key });

    return key;
  }

  close(path: string): void {
    this.#shares.delete(path);
  }

  // Watching needs only the path (it's random and only the room is told it); publishing needs the key.
  allows({ action, path, token }: MediaAccess): boolean {
    const share = liveMediaPathPattern.test(path) ? this.#shares.get(path) : undefined;

    if (!share) return false;

    if (action === 'read') return true;

    return action === 'publish' && sameKey(token, share.key);
  }

  get count(): number {
    return this.#shares.size;
  }

  dispose(): void {
    this.#shares.clear();
  }
}
