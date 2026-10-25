import type { CinemaIntents, CinemaIntentType } from '@cinemate/protocol';

export type { ViewerColor } from '@cinemate/protocol';

// Asks the room for something (an intent); the answer comes back in the next snapshot.
export type CinemaSend = <T extends CinemaIntentType>(type: T, message: CinemaIntents[T]) => void;

// How a status reads at a glance: in step, holding the room up (or about to), or neither.
export type StatusTone = 'sync' | 'late' | 'quiet';
