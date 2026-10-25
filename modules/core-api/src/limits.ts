import type { CinemaIntentType } from '@cinemate/protocol';

export interface Rate {
  count: number;
  windowMs: number;
}

// Every rate limit, size cap and timeout of core-api, in one place (spec §10.5).
export const limits = {
  room: {
    // People in one room (D14). Seats held for reconnecting people count too.
    maxClients: 12,
    // An empty room is kept this long, then thrown away (D13).
    emptyGraceMs: 10 * 60 * 1000,
    // A dropped connection keeps its seat this long (D13).
    reconnectSeconds: 20,
    // The cinema's clock: starts, waits, ends and "Up next" are checked this often.
    tickMs: 250,
    // Hard cap on messages from one connection; Colyseus disconnects anyone above it.
    maxMessagesPerSecond: 60,
    // Per person and intent: at most `count` in any `windowMs`. Extra messages are refused.
    rates: {
      sync: { count: 5, windowMs: 10_000 },
      ping: { count: 20, windowMs: 10_000 },
      enter: { count: 5, windowMs: 10_000 },
      rename: { count: 10, windowMs: 10_000 },
      recolor: { count: 20, windowMs: 10_000 },
      // Looser than the browser's pace (protocol `chatPace`, 5 in 3 s), so jitter never trips it.
      chat: { count: 8, windowMs: 3000 },
      react: { count: 8, windowMs: 1000 },
      // A few links a minute each (spec §10.5).
      add: { count: 12, windowMs: 60_000 },
      remove: { count: 20, windowMs: 10_000 },
      move: { count: 30, windowMs: 10_000 },
      replay: { count: 10, windowMs: 10_000 },
      describe: { count: 20, windowMs: 10_000 },
      play: { count: 10, windowMs: 5000 },
      pause: { count: 10, windowMs: 5000 },
      seek: { count: 20, windowMs: 5000 },
      skip: { count: 10, windowMs: 5000 },
      goOnWithout: { count: 5, windowMs: 5000 },
      holdUpNext: { count: 10, windowMs: 5000 },
      // Twice a second from the browser, with room for jitter.
      status: { count: 6, windowMs: 1000 },
      mediaError: { count: 5, windowMs: 10_000 },
      startShare: { count: 5, windowMs: 10_000 },
      stopShare: { count: 5, windowMs: 10_000 },
      // Every 2 s from each watcher (protocol `liveLimits.statsIntervalMs`), with room for jitter.
      watchStats: { count: 3, windowMs: 2000 },
    } satisfies Record<CinemaIntentType, Rate>,
  },
  // YouTube's oEmbed, for titles (spec §4.2).
  titles: {
    timeoutMs: 4000,
  },
} as const;
