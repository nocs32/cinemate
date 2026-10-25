import type { ViewerColor } from './people.js';

// What a pasted link plays with (spec §4.1): YouTube's embed player, or the browser's own video
// element for a file (`file`) or an HLS stream (`hls`, through hls.js where the browser can't).
export const mediaKinds = ['youtube', 'file', 'hls'] as const;

export type MediaKind = (typeof mediaKinds)[number];

// A video to play: for YouTube its video id, for the others the https address. `start` is where it
// begins, in seconds (a YouTube link's `t=`).
export interface MediaSource {
  kind: MediaKind;
  ref: string;
  start: number;
}

// Why a browser couldn't play a video (spec §4.2): the owner blocked embedding, it isn't there, the
// browser can't play that format, or the host doesn't allow it to be loaded from here (CORS).
export const mediaErrorCodes = ['blocked', 'notFound', 'unsupported', 'network'] as const;

export type MediaErrorCode = (typeof mediaErrorCodes)[number];

// Who added a queue item, kept with it for when they've left.
export interface QueueAuthor {
  id: string;
  name: string;
  color: ViewerColor;
}

// A video in the queue, playing, or played (spec §6). The title and thumbnail come from YouTube for
// YouTube links (null until they arrive) and the file name for files; the length comes from the
// first browser that loads it.
export interface QueueItem {
  id: string;
  source: MediaSource;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  addedBy: QueueAuthor;
}

// The queue's limits (spec §10.5).
export const queueLimits = {
  maxItems: 200,
  historyItems: 50,
  linkMaxLength: 2000,
  titleMaxLength: 200,
  // Twelve hours: a video can't be longer, and nobody seeks past it.
  maxSeconds: 12 * 60 * 60,
} as const;
