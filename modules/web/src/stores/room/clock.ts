import { clockOffset, type ClockSample } from '@cinemate/engine';
import { syncLimits, type CinemaPongEvent } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';
import type { CinemaSend } from './types';

export interface RoomClockDeps {
  send: CinemaSend;
  now: () => number;
  schedule: Schedule;
  repeat: Schedule;
}

// Samples kept: the fastest recent round trip wins.
const maxSamples = 12;
const burstGapMs = 200;

// The room clock (spec §5.1): how far the server's clock is from this browser's, from pings. A few
// pings on joining, one every 30 s after that, and a few again when the tab wakes up.
// States: idle → running.
export class RoomClockStore {
  state: 'idle' | 'running' = 'idle';
  offset = 0;
  #samples: ClockSample[] = [];
  #stops: Array<() => void> = [];
  readonly #deps: RoomClockDeps;

  constructor(deps: RoomClockDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  start(): void {
    if (this.state === 'running') return;

    this.state = 'running';
    this.burst();
    this.#stops = [this.#deps.repeat(this.ping, syncLimits.pingIntervalMs)];
  }

  burst(): void {
    Array.from({ length: syncLimits.pingSamples }, (_, index) => this.#deps.schedule(this.ping, index * burstGapMs));
  }

  ping(): void {
    this.#deps.send('ping', { sentAt: this.#deps.now() });
  }

  receivePong({ sentAt, serverNow }: CinemaPongEvent): void {
    this.#samples = [...this.#samples, { sentAt, serverNow, receivedAt: this.#deps.now() }].slice(-maxSamples);
    this.offset = clockOffset(this.#samples) ?? this.offset;
  }

  // The server's time now. Not tracked by MobX: read it when you need it.
  serverNow(): number {
    return this.#deps.now() + this.offset;
  }

  // A server time as this browser's.
  toLocal(serverTime: number): number {
    return serverTime - this.offset;
  }

  stop(): void {
    this.#stops.forEach((stop) => stop());
    this.#stops = [];
    this.state = 'idle';
  }
}
