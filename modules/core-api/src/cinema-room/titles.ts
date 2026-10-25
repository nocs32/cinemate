import { queueLimits } from '@cinemate/protocol';
import { limits } from '../limits.js';

// Finds a YouTube video's title, or null when YouTube doesn't say.
export type TitleLookup = (videoId: string) => Promise<string | null>;

const videoIdPattern = /^[A-Za-z0-9_-]{11}$/u;

const readTitle = (body: unknown): string | null => {
  if (typeof body !== 'object' || body === null || !('title' in body) || typeof body.title !== 'string') return null;

  return body.title.trim().slice(0, queueLimits.titleMaxLength) || null;
};

// YouTube's oEmbed endpoint (spec §4.2), called only with a video id the engine parsed from the link,
// never with the pasted address itself, so a link can't make the server fetch anything else.
export const fetchYoutubeTitle: TitleLookup = async (videoId) => {
  if (!videoIdPattern.test(videoId)) return null;

  const watch = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`, { signal: AbortSignal.timeout(limits.titles.timeoutMs) });

    return response.ok ? readTitle(await response.json()) : null;
  } catch {
    return null;
  }
};
