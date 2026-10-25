import { makeAutoObservable, reaction } from 'mobx';
import type { Schedule } from '../../services';

export interface RoomLightsDeps {
  schedule: Schedule;
  isPlaying: () => boolean;
}

const dimAfterMs = 3000;

// The house lights (spec §8, the style board): while a video plays and nobody moves the mouse or
// touches a key, the room dims and the screen's light spills onto the wall. Any movement brings them
// back up. States: up ⇄ down.
export class RoomLightsStore {
  state: 'up' | 'down' = 'up';
  readonly #deps: RoomLightsDeps;
  #cancel: (() => void) | null = null;
  #stop: (() => void) | null = null;

  constructor(deps: RoomLightsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isDown(): boolean {
    return this.state === 'down';
  }

  start(): void {
    this.#stop = reaction(this.#deps.isPlaying, this.wake, { fireImmediately: true });
  }

  wake(): void {
    this.state = 'up';
    this.#cancel?.();
    this.#cancel = this.#deps.schedule(this.dim, dimAfterMs);
  }

  dim(): void {
    if (this.#deps.isPlaying()) this.state = 'down';
  }

  dispose(): void {
    this.#cancel?.();
    this.#stop?.();
  }
}
