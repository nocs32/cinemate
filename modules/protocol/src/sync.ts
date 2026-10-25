// The sync rules' numbers (spec §5), the same for the server and every browser.
export const syncLimits = {
  // Further apart than this, and the room waits for whoever is off (D9).
  toleranceMs: 300,
  // A report has to be off this many times in a row (twice a second) before the room waits, so one
  // hiccup doesn't stop everyone.
  badReportsToWait: 2,
  // Right after starting, players settle for this long before anyone is judged.
  startupGraceMs: 1500,
  // Browsers report where their video is this often.
  statusIntervalMs: 500,
  // A browser that hasn't reported for this long (a frozen tab) isn't judged or waited for.
  staleReportMs: 4000,
  // Someone the room waits for longer than this has kept it waiting: it goes in the feed and in
  // their slowpoke count (D11).
  slowpokeAfterMs: 1500,
  // After this long waiting, everyone else may go on without the slow ones (D10).
  goOnAfterMs: 20_000,
  // A new video, and a restart after waiting, count down 3, 2, 1 with the film leader.
  countdownMs: 3000,
  // A restart after a pause or a seek starts this soon, so everyone gets the message in time.
  quickStartMs: 600,
  // The "Up next" card between videos (D18).
  upNextMs: 5000,
  // A player asked to be at a position counts as there within this much (keyframes, rounding).
  readySlackSeconds: 0.5,
  // Browsers check the clock this often (spec §5.1).
  pingIntervalMs: 30_000,
  pingSamples: 5,
} as const;

// What a browser says its player is doing (spec §5.4). `stuck` is a YouTube player that doesn't move
// while it should: it's loading, or showing an ad (the API can't tell which).
export const playerStates = ['idle', 'loading', 'ready', 'playing', 'paused', 'buffering', 'stuck', 'ended'] as const;

export type PlayerState = (typeof playerStates)[number];

// Each person's status as the room shows it (spec §7): in the seats, and in the waiting slate.
// `joining`: still on the join card. `catchingUp`: the room went on without them, or they joined
// mid-video, and they're getting back in step on their own.
export type ViewerStatus =
  | 'joining'
  | 'reconnecting'
  | 'loading'
  | 'ready'
  | 'inSync'
  | 'behind'
  | 'ahead'
  | 'buffering'
  | 'stuck'
  | 'paused'
  | 'catchingUp';

// Why the room is loading: a new video (it counts down after), a restart after a pause or a seek
// (quick), or a wait for someone who fell out of step (it counts down after).
export type LoadReason = 'start' | 'resume' | 'seek' | 'catchUp';
