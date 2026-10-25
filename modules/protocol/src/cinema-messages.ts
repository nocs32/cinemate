import * as v from 'valibot';
import { mediaErrorCodes, queueLimits } from './media.js';
import { personNameMaxLength, viewerColors } from './people.js';
import { playerStates } from './sync.js';

// Bumped whenever an intent or an event changes shape. A web app on another version is turned
// away with PROTOCOL_MISMATCH and asked to reload.
export const cinemaProtocolVersion = 1;

// The Colyseus room type the web app creates and joins.
export const cinemaRoomName = 'cinema';

export const chatMaxLength = 200;

// How fast one person may chat: the browser keeps to this pace and holds a line back when it's
// faster (spec §10.5). The server's own cap is a little looser, so network jitter never trips it.
export const chatPace = { count: 5, windowMs: 3000 } as const;

export const emojiMaxLength = 32;

// Emoji plus their components (joiners, variation selectors, keycaps, skin tones), with at
// least one non-ASCII character so plain digits, # and * don't count.
const emojiPattern = /^[\p{Emoji}\p{Emoji_Component}]+$/u;
const asciiPattern = /^[\x20-\x7e]*$/u;

const isEmoji = (text: string): boolean => emojiPattern.test(text) && !asciiPattern.test(text);

const seconds = v.pipe(v.number(), v.minValue(0), v.maxValue(queueLimits.maxSeconds));

// Server times in ms; checked against the server's own clock when they arrive.
const time = v.pipe(v.number(), v.minValue(0), v.maxValue(Number.MAX_SAFE_INTEGER));

const itemId = v.pipe(v.string(), v.maxLength(64));

const name = v.pipe(v.string(), v.maxLength(personNameMaxLength * 2));

const empty = v.strictObject({});

// Sent with create and join. `name` is the name this browser picked before (null: the room makes one
// up). `entered`: the person already clicked into the room (they opened it from the start page).
export const cinemaJoinOptionsSchema = v.strictObject({
  protocolVersion: v.pipe(v.number(), v.integer()),
  name: v.nullable(name),
  entered: v.boolean(),
});

export type CinemaJoinOptions = v.InferOutput<typeof cinemaJoinOptionsSchema>;

// Client → server: intents only; the server works out every result. Every message is checked
// against its schema, and unknown fields are rejected.
export const cinemaIntentSchemas = {
  // "Send me everything": after joining or reconnecting, once the browser listens.
  sync: empty,
  // The room clock (spec §5.1): the server answers with its time.
  ping: v.strictObject({ sentAt: time }),
  // Past the join card, with the name and colour picked there.
  enter: v.strictObject({ name, color: v.picklist(viewerColors) }),
  rename: v.strictObject({ name }),
  recolor: v.strictObject({ color: v.picklist(viewerColors) }),
  chat: v.strictObject({ text: v.pipe(v.string(), v.maxLength(chatMaxLength)) }),
  react: v.strictObject({ emoji: v.pipe(v.string(), v.maxLength(emojiMaxLength), v.check(isEmoji)) }),
  // The queue (spec §6): anyone adds, reorders, removes, or plays a played one again.
  add: v.strictObject({ url: v.pipe(v.string(), v.maxLength(queueLimits.linkMaxLength)) }),
  remove: v.strictObject({ itemId }),
  move: v.strictObject({ itemId, toIndex: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(queueLimits.maxItems)) }),
  replay: v.strictObject({ itemId }),
  // What a browser learned from loading a video: its length, and its title when the room has none.
  describe: v.strictObject({ itemId, duration: seconds, title: v.nullable(v.pipe(v.string(), v.maxLength(queueLimits.titleMaxLength))) }),
  // Playback, for everyone (spec §5.2).
  play: empty,
  pause: empty,
  seek: v.strictObject({ position: seconds }),
  skip: empty,
  goOnWithout: empty,
  holdUpNext: v.strictObject({ held: v.boolean() }),
  // Twice a second: what this browser's player is doing and where it is, at `sampledAt` (room clock).
  status: v.strictObject({ itemId: v.nullable(itemId), state: v.picklist(playerStates), position: seconds, sampledAt: time }),
  // The video can't be played here.
  mediaError: v.strictObject({ itemId, code: v.picklist(mediaErrorCodes) }),
};

export type CinemaIntentType = keyof typeof cinemaIntentSchemas;

export type CinemaIntents = { [K in CinemaIntentType]: v.InferOutput<(typeof cinemaIntentSchemas)[K]> };
