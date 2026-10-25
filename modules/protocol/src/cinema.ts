import type { MediaErrorCode, QueueItem } from './media.js';
import type { ViewerColor } from './people.js';
import type { LoadReason, ViewerStatus } from './sync.js';

// What a room looks like to everyone in it. The web app's stores read only these shapes, so the demo
// room and the real server are interchangeable behind them. Nothing in a room is secret.

export interface MemberSnapshot {
  id: string;
  name: string;
  color: ViewerColor;
  connected: boolean;
  // Past the join card (spec §9): only then is the room ever waited for them.
  entered: boolean;
  status: ViewerStatus;
  // How far behind (negative) or ahead their video is, rounded to 100 ms, when that's their status.
  offsetMs: number | null;
  // How many times they've kept the room waiting tonight (D11).
  slowpokes: number;
  // While someone shares: the frames a second this person's screen shows (D31), null until known.
  watchFps: number | null;
}

// empty: nothing to play. loading: everyone gets the video ready at `position` (then plays if
// `resume`). playing: from `position` at `at` (server time, possibly a moment ahead: the start).
// paused at `position`. upNext: the card between videos. ended: the queue ran out.
export type PlaybackPhase = 'empty' | 'loading' | 'playing' | 'paused' | 'upNext' | 'ended';

export interface PlaybackSnapshot {
  phase: PlaybackPhase;
  // The video on screen; the last one played once the queue ran out (ended), null when empty.
  item: QueueItem | null;
  position: number;
  at: number;
  // Loading: whether it plays once everyone is ready, why it's loading, and since when (server time).
  resume: boolean;
  reason: LoadReason | null;
  waitSince: number | null;
  // Loading: who the room still waits for.
  waitingFor: string[];
  // Who the room went on without (D10), and anyone who came in mid-video: they catch up on their own.
  excused: string[];
  // Playing: the start counts down 3, 2, 1 with the film leader.
  countdown: boolean;
  // Up next: when the next one starts (server time), unless someone holds the card.
  upNextAt: number | null;
  upNextHeld: boolean;
}

// What a system line says. Kept as data, so each viewer reads it in their own language. The line's
// author is who did it, or (`waiting`) who the room waited for.
export type FeedEvent =
  | { type: 'joined' }
  | { type: 'left' }
  | { type: 'renamed'; name: string }
  | { type: 'added'; title: string }
  | { type: 'removed'; title: string }
  | { type: 'played'; at: number }
  | { type: 'paused'; at: number }
  | { type: 'seeked'; at: number }
  | { type: 'skipped'; title: string }
  | { type: 'waiting'; status: ViewerStatus }
  | { type: 'wentOnWithout'; names: string[] }
  | { type: 'failed'; title: string; code: MediaErrorCode }
  | { type: 'shareStarted' }
  | { type: 'shareStopped' };

interface FeedItemBase {
  id: string;
  authorId: string;
  // Their latest name and their colour, kept for when they're no longer in the room.
  authorName: string;
  authorColor: ViewerColor;
  at: number;
}

export type FeedItem = (FeedItemBase & { kind: 'message'; text: string }) | (FeedItemBase & { kind: 'system'; event: FeedEvent });

// Feed lines a room keeps (and a browser shows); the oldest go first.
export const feedMaxItems = 200;

export interface CinemaReactionEvent {
  memberId: string;
  emoji: string;
}
