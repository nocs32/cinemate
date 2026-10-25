import { createAddress } from './address';
import { createDemoRoom } from './demo-room';
import { createFullscreen } from './fullscreen';
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

export const createServices = (): Services => ({
  preferences: createPreferences(),
  translator: createTranslator(),
  clipboard: { writeText: (text) => navigator.clipboard.writeText(text) },
  address: createAddress(),
  // The web UI is built against the demo room (spec §12 M1): the engine's cinema and sample viewers
  // in the browser, with no server. Live rooms on core-api come with M2.
  cinemaClient: createDemoRoom({ schedule, repeat, random: Math.random, now: Date.now, createId }),
  createPlayer: createPlayerFactory(),
  fullscreen: createFullscreen(),
  schedule,
  repeat,
  random: Math.random,
  now: Date.now,
  createId,
  origin: window.location.origin,
  browserLanguages: navigator.languages.length > 0 ? navigator.languages : [navigator.language],
});
