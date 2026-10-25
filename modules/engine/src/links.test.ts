import { expect, test } from 'vitest';
import { parseMediaLink, parseStart, thumbnailFor } from './links.js';

const youtube = (text: string): string | null => {
  const result = parseMediaLink(text);

  return result.ok && result.source.kind === 'youtube' ? result.source.ref : null;
};

test('every YouTube link shape names the same video', () => {
  const shapes = [
    'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    'https://youtube.com/watch?v=aqz-KE-bpKQ&list=PL123&index=2',
    'https://m.youtube.com/watch?v=aqz-KE-bpKQ',
    'https://music.youtube.com/watch?v=aqz-KE-bpKQ',
    'https://youtu.be/aqz-KE-bpKQ',
    'https://youtu.be/aqz-KE-bpKQ?si=abc',
    'https://www.youtube.com/shorts/aqz-KE-bpKQ',
    'https://www.youtube.com/embed/aqz-KE-bpKQ',
    'https://www.youtube.com/live/aqz-KE-bpKQ?feature=share',
    'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    'http://www.youtube.com/watch?v=aqz-KE-bpKQ',
    'youtu.be/aqz-KE-bpKQ',
    '  www.youtube.com/watch?v=aqz-KE-bpKQ  ',
  ];

  shapes.forEach((shape) => expect(youtube(shape), shape).toBe('aqz-KE-bpKQ'));
});

test('a YouTube start time is kept', () => {
  const result = parseMediaLink('https://youtu.be/aqz-KE-bpKQ?t=1m30s');

  expect(result.ok && result.source.start).toBe(90);
  expect(parseStart('90')).toBe(90);
  expect(parseStart('90s')).toBe(90);
  expect(parseStart('1h2m3s')).toBe(3723);
  expect(parseStart('soon')).toBe(0);
  expect(parseStart(null)).toBe(0);
});

test('video files and HLS streams are read, with the file name as the title', () => {
  expect(parseMediaLink('https://example.com/films/My%20Film.mp4?token=1')).toEqual({ ok: true, source: { kind: 'file', ref: 'https://example.com/films/My%20Film.mp4?token=1', start: 0 }, title: 'My Film.mp4' });
  expect(parseMediaLink('https://cdn.example.com/live/master.M3U8')).toMatchObject({ ok: true, source: { kind: 'hls' } });
  expect(parseMediaLink('https://example.com/clip.webm')).toMatchObject({ ok: true, source: { kind: 'file' } });
});

test('junk, plain http files and other pages are refused with a reason', () => {
  expect(parseMediaLink('')).toEqual({ ok: false, error: 'NOT_A_LINK' });
  expect(parseMediaLink('just some words')).toEqual({ ok: false, error: 'NOT_A_LINK' });
  expect(parseMediaLink('ftp://example.com/a.mp4')).toEqual({ ok: false, error: 'NOT_A_LINK' });
  expect(parseMediaLink('javascript:alert(1)')).toEqual({ ok: false, error: 'NOT_A_LINK' });
  expect(parseMediaLink('http://example.com/a.mp4')).toEqual({ ok: false, error: 'NOT_HTTPS' });
  expect(parseMediaLink('https://vimeo.com/76979871')).toEqual({ ok: false, error: 'UNSUPPORTED_LINK' });
  expect(parseMediaLink('https://www.youtube.com/watch?v=short')).toEqual({ ok: false, error: 'UNSUPPORTED_LINK' });
  expect(parseMediaLink('https://www.youtube.com/@blender')).toEqual({ ok: false, error: 'UNSUPPORTED_LINK' });
});

test('YouTube videos get YouTube thumbnails; files get none', () => {
  expect(thumbnailFor({ kind: 'youtube', ref: 'aqz-KE-bpKQ', start: 0 })).toBe('https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg');
  expect(thumbnailFor({ kind: 'file', ref: 'https://example.com/a.mp4', start: 0 })).toBeNull();
});
