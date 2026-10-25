import * as v from 'valibot';

// Live share (spec §14): someone shows a tab or their screen to the room through the relay (MediaMTX).
// The browser publishes over WHIP and everyone watches over WHEP, at `${origin}/media/<path>/whip|whep`.

// Someone is sharing. `path` is the relay's path for this share: random, so only the room can find it.
export interface ShareSnapshot {
  sharerId: string;
  path: string;
  since: number;
}

// Sent only to whoever started the share: the key the relay asks for before it takes their stream.
export interface CinemaShareKeyEvent {
  path: string;
  key: string;
}

// Where the relay answers, under the site's own address: Caddy (and Vite in dev) forward it.
export const liveMediaPrefix = '/media';

export const liveMediaPath = (shareId: string): string => `live/${shareId}`;

// The relay's paths: live/ and a share id (a UUID).
export const liveMediaPathPattern = /^live\/[0-9a-f-]{36}$/u;

// What the relay (MediaMTX's `authHTTPAddress`) asks core-api before every publish and every watch.
// It sends more fields (user, ip, protocol, id, query); only these matter. `token` is the publish key
// from the sharer's `Authorization: Bearer` header.
export const mediaAccessSchema = v.object({
  action: v.pipe(v.string(), v.maxLength(32)),
  path: v.pipe(v.string(), v.maxLength(200)),
  token: v.optional(v.pipe(v.string(), v.maxLength(200)), ''),
});

export type MediaAccess = v.InferOutput<typeof mediaAccessSchema>;

// What the sharer picks (D32): the picture's size, frames a second and top bitrate in Mbps. Everyone gets
// exactly this (the relay never re-encodes); everyone has over 1 Gbps.
export const liveQualities = {
  best: { width: 3840, height: 2160, frameRate: 60, mbps: 40 },
  high: { width: 2560, height: 1440, frameRate: 60, mbps: 25 },
  smooth: { width: 1920, height: 1080, frameRate: 60, mbps: 12 },
  light: { width: 1920, height: 1080, frameRate: 30, mbps: 6 },
} as const;

export type LiveQuality = keyof typeof liveQualities;

export const liveQualityOrder: readonly LiveQuality[] = ['best', 'high', 'smooth', 'light'];

// The spike's numbers (spec §14.5).
export const liveLimits = {
  // Chrome's own bandwidth guess stalls near zero on a fresh connection to the relay, and the picture
  // shrinks to a postage stamp; the spike's fix is a floor and a starting point, as shares of the
  // quality's top bitrate.
  floorShare: 0.5,
  startShare: 0.75,
  // Opus at full stereo bitrate, not Chrome's mono voice default.
  audioBitrate: 510_000,
  // The codecs a share tries, in order: the first one this browser can send wins. AV1 first: it's what
  // held 4K60 in the spike; H.264 is the fallback every device can decode.
  codecs: ['video/AV1', 'video/H264', 'video/VP9'],
  // Watchers tell the room how many frames a second they see, this often (D31).
  statsIntervalMs: 2000,
  // Below this, a seat says the viewer's picture is struggling.
  smoothFps: 50,
  // A watcher that can't reach the stream yet (the sharer is still connecting) tries again this soon.
  retryMs: 1500,
} as const;
