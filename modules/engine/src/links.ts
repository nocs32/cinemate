import { queueLimits, type MediaKind, type MediaSource } from '@cinemate/protocol';

export type LinkError = 'NOT_A_LINK' | 'NOT_HTTPS' | 'UNSUPPORTED_LINK';

// A pasted link, read (spec §4.1): what plays it, and a title when the link itself has one (a
// file's name). YouTube titles come later, from YouTube.
export type LinkResult = { ok: true; source: MediaSource; title: string | null } | { ok: false; error: LinkError };

const youtubeHosts: ReadonlySet<string> = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const videoIdPattern = /^[A-Za-z0-9_-]{11}$/u;

// /shorts/ID, /embed/ID, /live/ID and /v/ID all name the video in the path.
const pathIdPattern = /^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})(?:[/?#]|$)/u;

const fileKinds: Readonly<Record<string, MediaKind>> = {
  mp4: 'file',
  m4v: 'file',
  webm: 'file',
  mov: 'file',
  ogv: 'file',
  m3u8: 'hls',
};

// `t=90`, `t=90s`, `t=1m30s` or `t=1h2m3s`; anything else starts at the beginning.
export const parseStart = (value: string | null): number => {
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/u.exec(value ?? '');

  if (!match || !value) return 0;

  const [, hours = '0', minutes = '0', secs = '0'] = match;

  return Math.min(Number(hours) * 3600 + Number(minutes) * 60 + Number(secs), queueLimits.maxSeconds);
};

const youtubeId = (url: URL): string | null => {
  const id = url.hostname === 'youtu.be' ? url.pathname.slice(1).split('/')[0] : url.pathname === '/watch' ? url.searchParams.get('v') : pathIdPattern.exec(url.pathname)?.[1];

  return id && videoIdPattern.test(id) ? id : null;
};

const isYoutube = (url: URL): boolean => url.hostname === 'youtu.be' || youtubeHosts.has(url.hostname);

// "youtu.be/abc" pasted without https:// still counts.
const toUrl = (text: string): URL | null => {
  const trimmed = text.trim();

  if (!trimmed || /\s/u.test(trimmed)) return null;

  return URL.parse(trimmed) ?? (/^[\w-]+(\.[\w-]+)+\//u.test(trimmed) ? URL.parse(`https://${trimmed}`) : null);
};

const fileName = (url: URL): string | null => {
  const last = url.pathname.split('/').at(-1) ?? '';

  try {
    return decodeURIComponent(last) || null;
  } catch {
    return last || null;
  }
};

const readYoutube = (url: URL): LinkResult => {
  const id = youtubeId(url);

  if (!id) return { ok: false, error: 'UNSUPPORTED_LINK' };

  return { ok: true, source: { kind: 'youtube', ref: id, start: parseStart(url.searchParams.get('t') ?? url.searchParams.get('start')) }, title: null };
};

const readFile = (url: URL): LinkResult => {
  const extension = url.pathname.split('.').at(-1)?.toLowerCase() ?? '';
  const kind = fileKinds[extension];

  if (!kind) return { ok: false, error: 'UNSUPPORTED_LINK' };

  if (url.protocol !== 'https:') return { ok: false, error: 'NOT_HTTPS' };

  return { ok: true, source: { kind, ref: url.href, start: 0 }, title: fileName(url) };
};

export const parseMediaLink = (text: string): LinkResult => {
  const url = toUrl(text);

  if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:')) return { ok: false, error: 'NOT_A_LINK' };

  return isYoutube(url) ? readYoutube(url) : readFile(url);
};

// YouTube's own thumbnail for a video; files have none.
export const thumbnailFor = (source: MediaSource): string | null =>
  source.kind === 'youtube' ? `https://i.ytimg.com/vi/${source.ref}/hqdefault.jpg` : null;
