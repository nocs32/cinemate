import type { CinemaErrorCode } from '@cinemate/protocol';

// Thrown by the cinema's rules when someone asks for something the room can't do right now. The
// server (or the demo room) sends it back to them as an `error` event.
export class CinemaRuleError extends Error {
  readonly code: CinemaErrorCode;

  constructor(code: CinemaErrorCode) {
    super(code);
    this.name = 'CinemaRuleError';
    this.code = code;
  }
}
