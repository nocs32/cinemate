import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';
import type { Translate } from '../locale';

export const flightLanes = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9'] as const;

export type FlightLane = (typeof flightLanes)[number];

export const flightSways = ['gentle', 'wide', 'wobbly'] as const;

export type FlightSway = (typeof flightSways)[number];

export interface Flight {
  id: string;
  emoji: string;
  lane: FlightLane;
  sway: FlightSway;
  // Whose it is: a member's id, or '' for your own.
  from: string;
  // The name tag under it: only on the first of someone's stream, never on your own.
  sender: string | null;
}

export interface QuickReactionView {
  emoji: string;
  label: string;
}

export interface RoomReactionsDeps {
  random: () => number;
  createId: () => string;
  schedule: Schedule;
  repeat: Schedule;
  t: Translate;
  // Tells everyone else in the room.
  send: (emoji: string) => void;
}

export const defaultQuickReactions: readonly string[] = ['😂', '😮', '❤️'];

const quickSize = 3;
// However hard anyone holds a button down, no more than this many of theirs are in the air at once,
// and no more than `maxFlights` in all, so a stream never covers a phone's screen.
const perSender = 5;
const maxFlights = 20;
const holdDelayMs = 350;
const streamIntervalMs = 160;

const pickFrom = <T>(items: readonly T[], random: () => number, fallback: T): T =>
  items[Math.floor(random() * items.length)] ?? fallback;

// Each person's reactions rise in their own lane, so one person's stream stays together.
const laneOf = (senderId: string): FlightLane => {
  const hash = [...senderId].reduce((sum, char) => (sum * 31 + (char.codePointAt(0) ?? 0)) % 9973, 7);

  return flightLanes[hash % flightLanes.length] ?? 'l5';
};

// Huddle-style reactions: emoji in flight, the quick bar of recent emoji,
// and press-and-hold streaming (idle → holding → streaming → idle).
export class RoomReactionsStore {
  quick: string[] = [...defaultQuickReactions];
  flights: Flight[] = [];
  readonly #deps: RoomReactionsDeps;
  #stopTimers: Array<() => void> = [];

  constructor(deps: RoomReactionsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get quickButtons(): QuickReactionView[] {
    return this.quick.map((emoji) => ({ emoji, label: this.#deps.t('reactions.react', { emoji }) }));
  }

  // Our own reaction: it flies here at once and goes to everyone else, unless enough of ours are
  // in the air already.
  fire(emoji: string): void {
    if (this.#launch(emoji, pickFrom(flightLanes, this.#deps.random, 'l5'), '', null)) this.#deps.send(emoji);
  }

  // Someone else's reaction, with their name on it.
  receive(emoji: string, senderId: string, senderName: string): void {
    this.#launch(emoji, laneOf(senderId), senderId, senderName);
  }

  land(id: string): void {
    this.flights = this.flights.filter((flight) => flight.id !== id);
  }

  // Pointer down: one emoji now; keep holding and they stream.
  startStream(emoji: string): void {
    this.stopStream();
    this.fire(emoji);

    const stopDelay = this.#deps.schedule(() => {
      this.#stopTimers.push(this.#deps.repeat(() => this.fire(emoji), streamIntervalMs));
    }, holdDelayMs);

    this.#stopTimers = [stopDelay];
  }

  stopStream(): void {
    this.#stopTimers.forEach((stop) => stop());
    this.#stopTimers = [];
  }

  // Keyboard activation of a button (Enter/Space) produces a click with detail 0.
  fireFromKeyboard(emoji: string, clickDetail: number): void {
    if (clickDetail === 0) {
      this.fire(emoji);
    }
  }

  // An emoji picked from the full picker fires and joins the front of the quick bar.
  pick(emoji: string): void {
    this.fire(emoji);
    this.quick = [emoji, ...this.quick.filter((quickEmoji) => quickEmoji !== emoji)].slice(0, quickSize);
  }

  // Sends one up, unless too many of the sender's are in the air: says whether it went.
  #launch(emoji: string, lane: FlightLane, from: string, name: string | null): boolean {
    const theirs = this.flights.filter((flight) => flight.from === from).length;

    if (theirs >= perSender) return false;

    const sender = theirs === 0 ? name : null;
    const flight: Flight = { id: this.#deps.createId(), emoji, lane, sway: pickFrom(flightSways, this.#deps.random, 'gentle'), from, sender };

    this.flights = [...this.flights, flight].slice(-maxFlights);

    return true;
  }
}
