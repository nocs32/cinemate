import { createAddress } from './address';
import { createDemoRoom } from './demo-room';
import { createFullscreen } from './fullscreen';
import { createDemoLiveMedia, createLiveMedia } from './live-media';
import { createLiveRoom } from './live-room';
import { createPlayerFactory } from './players';
import { createPreferences } from './preferences';
import { createTranslator } from './translator';
import type { Schedule, Services } from './types';

export type {
  AddressService,
  CinemaClientService,
  CinemaConnectionState,
  CinemaLink,
  CinemaLinkListeners,
  CinemaOpenFailure,
  CinemaOpenRequest,
  CinemaOpenResult,
  ClipboardService,
  DemoAction,
  DemoControls,
  FullscreenService,
  LiveCaptureResult,
  LiveMediaService,
  LiveScreen,
  LiveScreenListeners,
  LiveShare,
  PlayerUserAction,
  PreferencesService,
  QualityChoice,
  Schedule,
  ScreenPlayer,
  ScreenPlayerFactory,
  ScreenPlayerListeners,
  Services,
  TranslatorService,
  VolumePreference,
} from './types';

export { demoActions } from './types';

const schedule: Schedule = (callback, delayMs) => {
  const timer = window.setTimeout(callback, delayMs);

  return () => window.clearTimeout(timer);
};

const repeat: Schedule = (callback, intervalMs) => {
  const timer = window.setInterval(callback, intervalMs);

  return () => window.clearInterval(timer);
};

const createId = (): string => crypto.randomUUID();

const isDemo = import.meta.env.MODE === 'demo';

export const createServices = (): Services => ({
  preferences: createPreferences(),
  translator: createTranslator(),
  clipboard: { writeText: (text) => navigator.clipboard.writeText(text) },
  address: createAddress(),
  // Live rooms on core-api; `pnpm demo` (Vite's demo mode) plays in the demo room instead: the
  // engine's cinema and sample viewers in the browser, with no server.
  cinemaClient: isDemo ? createDemoRoom({ schedule, repeat, random: Math.random, now: Date.now, createId }) : createLiveRoom(window.location.origin, Date.now),
  createPlayer: createPlayerFactory(),
  liveMedia: isDemo ? createDemoLiveMedia(schedule) : createLiveMedia(window.location.origin, schedule),
  fullscreen: createFullscreen(),
  schedule,
  repeat,
  random: Math.random,
  now: Date.now,
  createId,
  origin: window.location.origin,
  browserLanguages: navigator.languages.length > 0 ? navigator.languages : [navigator.language],
});
