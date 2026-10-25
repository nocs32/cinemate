import type { CinemaIntentType } from './cinema-messages.js';

// Error codes of a live room. A refused join arrives as the join error's message; a refused intent
// arrives as an `error` event ({ code, type }) and the sender stays in the room.
export const cinemaErrorCodes = [
  // The web app and the server speak different protocol versions: reload.
  'PROTOCOL_MISMATCH',
  'INVALID_JOIN',
  'INVALID_MESSAGE',
  'RATE_LIMITED',
  'NOT_A_MEMBER',
  'ALREADY_A_MEMBER',
  'ROOM_CLOSED',
  // A rename that's empty once cleaned up.
  'EMPTY_NAME',
  // Someone else in the room already wears that colour.
  'COLOR_TAKEN',
  // A link that isn't one, isn't https, or isn't a YouTube video or a video file (spec §4.1).
  'NOT_A_LINK',
  'NOT_HTTPS',
  'UNSUPPORTED_LINK',
  'QUEUE_FULL',
  // A queue item that isn't there (any more).
  'NO_SUCH_ITEM',
  // Nothing on screen to play, pause or seek.
  'NOTHING_PLAYING',
  // Going on without someone before the room has waited 20 seconds (D10).
  'TOO_SOON',
] as const;

export type CinemaErrorCode = (typeof cinemaErrorCodes)[number];

export const isCinemaErrorCode = (value: unknown): value is CinemaErrorCode =>
  typeof value === 'string' && (cinemaErrorCodes as readonly string[]).includes(value);

// A refused intent, and which one it was.
export interface CinemaErrorEvent {
  code: CinemaErrorCode;
  type: CinemaIntentType;
}
