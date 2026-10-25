import { liveMediaPrefix, liveQualities, type LiveQuality } from '@cinemate/protocol';
import type { LiveCaptureResult, LiveMediaService, Schedule } from '../types';
import { LiveMediaScreen } from './screen';
import { LiveMediaShare } from './share';

// Chrome's picker opens on the tab list (D28: a tab sends only its own sound, so the Discord call stays
// out); the screen is there too. Sound processing is off: it's a film, not a voice.
const captureOptions = {
  video: { width: { max: liveQualities.best.width }, height: { max: liveQualities.best.height }, frameRate: { ideal: liveQualities.best.frameRate, max: liveQualities.best.frameRate }, displaySurface: 'browser' },
  audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, suppressLocalAudioPlayback: false },
  preferCurrentTab: false,
  selfBrowserSurface: 'exclude',
  surfaceSwitching: 'include',
  systemAudio: 'include',
} as DisplayMediaStreamOptions;

const capture = async (quality: LiveQuality, ended: () => void): Promise<LiveCaptureResult> => {
  if (typeof navigator.mediaDevices?.getDisplayMedia !== 'function') return { ok: false, reason: 'unsupported' };

  try {
    return { ok: true, share: new LiveMediaShare(await navigator.mediaDevices.getDisplayMedia(captureOptions), quality, ended) };
  } catch {
    return { ok: false, reason: 'cancelled' };
  }
};

// Live share through the relay (spec §14), which answers under the site's own address at /media.
export const createLiveMedia = (origin: string, schedule: Schedule): LiveMediaService => {
  const base = `${origin}${liveMediaPrefix}`;

  return {
    capture,
    publish: (share, path, key) => share.publish(`${base}/${path}/whip`, key),
    attach: (element, listeners) => new LiveMediaScreen(element, listeners, { whepUrl: (path) => `${base}/${path}/whep`, schedule }),
  };
};

// The demo room has no relay: only you are real, and you see your own share as a preview.
export const createDemoLiveMedia = (schedule: Schedule): LiveMediaService => ({
  capture,
  publish: () => Promise.resolve(),
  attach: (element, listeners) => new LiveMediaScreen(element, listeners, { whepUrl: null, schedule }),
});
