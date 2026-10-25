import type { CinemaErrorEvent, CinemaIntents, CinemaIntentType, CinemaPongEvent, CinemaReactionEvent, CinemaShareKeyEvent, CinemaSnapshot, LiveQuality, MediaErrorCode, MediaSource, PlayerState, ViewerColor } from '@cinemate/protocol';
import type { Language, TranslationKey, TranslationValues } from '../i18n';

export interface VolumePreference {
  // 0–100.
  volume: number;
  muted: boolean;
}

// This browser's own settings, kept in localStorage.
export interface PreferencesService {
  loadLanguage: () => Language | null;
  saveLanguage: (language: Language) => void;
  loadName: () => string | null;
  saveName: (name: string) => void;
  loadColor: () => ViewerColor | null;
  saveColor: (color: ViewerColor) => void;
  loadVolume: () => VolumePreference | null;
  saveVolume: (volume: VolumePreference) => void;
}

export interface TranslatorService {
  translate: (language: Language, key: TranslationKey, values?: TranslationValues) => string;
  formatTime: (language: Language, at: number) => string;
}

export interface ClipboardService {
  writeText: (text: string) => Promise<void>;
}

// Runs `callback` later (once, or on an interval) and returns a function that cancels it.
export type Schedule = (callback: () => void, delayMs: number) => () => void;

// The room's address: /r/:roomId, or the start page at /.
export interface AddressService {
  roomId: () => string | null;
  showRoom: (roomId: string) => void;
  // Goes to `/`, the start page.
  startNew: () => void;
  reload: () => void;
}

export interface CinemaLinkListeners {
  snapshot: (snapshot: CinemaSnapshot) => void;
  pong: (event: CinemaPongEvent) => void;
  // Someone else's reaction.
  reaction: (event: CinemaReactionEvent) => void;
  // The room said yes to this browser's share: the relay's path and the key to publish with.
  shareKey: (event: CinemaShareKeyEvent) => void;
  // The connection dropped (the room holds the seat for a while), or came back.
  connection: (state: CinemaConnectionState) => void;
  // The seat is gone for good: the room closed, or getting back in took too long.
  closed: () => void;
  // The room refused something this browser asked for.
  refused: (event: CinemaErrorEvent) => void;
}

export type CinemaConnectionState = 'live' | 'reconnecting';

// Why a room couldn't be opened: it was cleared, it's full, this web app is out of date, or the
// server can't be reached.
export type CinemaOpenFailure = 'gone' | 'full' | 'outdated' | 'unreachable';

export type CinemaOpenResult = { ok: true; link: CinemaLink } | { ok: false; failure: CinemaOpenFailure };

// Buttons for trying the room alone: only the demo room has them. Each sends a sample viewer into a
// state the room has to deal with.
export const demoActions = ['buffer', 'ad', 'lag', 'addViewer', 'removeViewer'] as const;

export type DemoAction = (typeof demoActions)[number];

export interface DemoControls {
  run: (action: DemoAction) => void;
}

// An open room: who you are there, and a way to ask for things.
export interface CinemaLink {
  readonly roomId: string;
  readonly meId: string;
  readonly demo: DemoControls | null;
  send: <T extends CinemaIntentType>(type: T, message: CinemaIntents[T]) => void;
  close: () => void;
}

export interface CinemaOpenRequest {
  // null sets up a new room.
  roomId: string | null;
  name: string | null;
  // Already clicked into the room (it was opened from the start page).
  entered: boolean;
}

export interface CinemaClientService {
  open: (request: CinemaOpenRequest, listeners: CinemaLinkListeners) => Promise<CinemaOpenResult>;
}

// What the player's own buttons did (YouTube's bar): sent to the room as that person's move (D12).
export type PlayerUserAction = { type: 'play' } | { type: 'pause' } | { type: 'seek'; position: number };

export interface ScreenPlayerListeners {
  // Its state, time or what it knows changed.
  changed: () => void;
  userAction: (action: PlayerUserAction) => void;
  failed: (code: MediaErrorCode) => void;
  // What loading the video taught it: its length, and its title (YouTube's).
  described: (duration: number, title: string | null) => void;
}

// A video's quality levels (HLS streams), or its one quality (files). YouTube's are in its own menu.
export interface QualityChoice {
  // -1 is automatic.
  levels: Array<{ index: number; label: string }>;
  current: number;
  label: string | null;
}

// The screen's player (spec §10.2): YouTube's or the browser's own, behind one interface, so the
// sync code never knows which it drives.
export interface ScreenPlayer {
  readonly itemId: string | null;
  // Gets the video ready, buffered and paused at `position`.
  load: (itemId: string, source: MediaSource, position: number) => void;
  play: () => void;
  pause: () => void;
  seek: (position: number) => void;
  // Empties the screen.
  stop: () => void;
  time: () => number;
  state: () => PlayerState;
  // Only files and streams: YouTube has its own volume, quality and subtitles in its bar.
  setVolume: (volume: VolumePreference) => void;
  quality: () => QualityChoice | null;
  setQuality: (index: number) => void;
  // Playing muted because nobody has clicked on the page yet (browsers block sound until then).
  soundBlocked: () => boolean;
  // A click happened: sound may play now.
  allowSound: () => void;
  destroy: () => void;
}

// Makes the screen's player inside the element the screen gives it.
export type ScreenPlayerFactory = (element: HTMLElement, listeners: ScreenPlayerListeners) => ScreenPlayer;

// Live share (spec §14): a picked tab or screen, sent to the relay once the room says yes.
export interface LiveShare {
  readonly stream: MediaStream;
  readonly hasSound: boolean;
  publish: (url: string, key: string) => Promise<void>;
  // While it's live too: the picture's size, frame rate and top bitrate (D32).
  setQuality: (quality: LiveQuality) => Promise<void>;
  setSound: (on: boolean) => void;
  // Stops sending and ends the capture (Chrome's "sharing" bar goes away).
  stop: () => void;
}

// `cancelled`: the person closed the picker. `unsupported`: this browser can't share (phones).
export type LiveCaptureResult = { ok: true; share: LiveShare } | { ok: false; reason: 'cancelled' | 'unsupported' };

export interface LiveScreenListeners {
  // It started playing, or the sound came on.
  changed: () => void;
}

// The video over the screen that shows a live share (a service, like the screen's player).
export interface LiveScreen {
  readonly soundBlocked: boolean;
  // The room's share from the relay.
  watch: (path: string) => void;
  // The sharer's own picture, straight from the capture, silent.
  preview: (share: LiveShare) => void;
  clear: () => void;
  setVolume: (volume: VolumePreference) => void;
  allowSound: () => void;
  // Frames a second since the last ask, or null before there's a picture.
  fps: () => Promise<number | null>;
  destroy: () => void;
}

export interface LiveMediaService {
  // Opens the browser's picker; `ended` is called if the person stops sharing from Chrome's own bar.
  capture: (quality: LiveQuality, ended: () => void) => Promise<LiveCaptureResult>;
  publish: (share: LiveShare, path: string, key: string) => Promise<void>;
  // Puts the live screen's video into the element the screen gives it.
  attach: (element: HTMLElement, listeners: LiveScreenListeners) => LiveScreen;
}

export interface FullscreenService {
  // The element that goes fullscreen: the screen with everything drawn over it.
  setTarget: (element: HTMLElement | null) => void;
  toggle: () => void;
  isOn: () => boolean;
  // Tells `changed` whenever fullscreen starts or ends; returns a function that stops it.
  listen: (changed: () => void) => () => void;
}

// Everything stores need from the outside world, created once in index.tsx.
export interface Services {
  preferences: PreferencesService;
  translator: TranslatorService;
  clipboard: ClipboardService;
  address: AddressService;
  cinemaClient: CinemaClientService;
  createPlayer: ScreenPlayerFactory;
  liveMedia: LiveMediaService;
  fullscreen: FullscreenService;
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
  origin: string;
  // The browser's languages, most preferred first (navigator.languages).
  browserLanguages: readonly string[];
}
