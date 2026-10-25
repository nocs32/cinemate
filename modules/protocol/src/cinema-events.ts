import type { CinemaReactionEvent, FeedItem, MemberSnapshot, PlaybackSnapshot } from './cinema.js';
import type { CinemaErrorEvent } from './cinema-errors.js';
import type { CinemaShareKeyEvent, ShareSnapshot } from './live.js';
import type { QueueItem } from './media.js';

// Server → client events of a live room. The web app's room client turns them back into the
// snapshots the stores read, the same shapes the demo room sends.

// The room as everyone sees it. `now` is the server's clock when it was sent.
export interface CinemaViewEvent {
  now: number;
  members: MemberSnapshot[];
  playback: PlaybackSnapshot;
  queue: QueueItem[];
  history: QueueItem[];
  // Someone is sharing a tab or their screen (spec §14).
  share: ShareSnapshot | null;
}

// New feed lines, or (`reset`) all of them, after joining or reconnecting.
export interface CinemaFeedEvent {
  reset: boolean;
  items: FeedItem[];
}

// The answer to a `ping`: the browser's own send time back, and the server's time (spec §5.1).
export interface CinemaPongEvent {
  sentAt: number;
  serverNow: number;
}

export interface CinemaEvents {
  view: CinemaViewEvent;
  feed: CinemaFeedEvent;
  pong: CinemaPongEvent;
  reaction: CinemaReactionEvent;
  error: CinemaErrorEvent;
  shareKey: CinemaShareKeyEvent;
}

// The whole room, as the stores read it.
export interface CinemaSnapshot {
  members: MemberSnapshot[];
  playback: PlaybackSnapshot;
  queue: QueueItem[];
  history: QueueItem[];
  share: ShareSnapshot | null;
  feed: FeedItem[];
}
