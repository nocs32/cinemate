import type { CinemaErrorCode } from '@cinemate/protocol';

// Thrown by the room's parts when an event isn't allowed in the current state.
// The room turns it into an `error` event for the sender (or a refused join).
export class CinemaRoomError extends Error {
  readonly code: CinemaErrorCode;

  constructor(code: CinemaErrorCode, message: string = code) {
    super(message);
    this.name = 'CinemaRoomError';
    this.code = code;
  }
}
