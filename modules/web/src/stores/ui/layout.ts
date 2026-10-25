import { makeAutoObservable } from 'mobx';

// wide ⇄ compact: a phone held sideways (or a small window) is compact, and the room folds its sidebar
// into a narrower column beside the screen (spec §9).
export type UiLayoutState = 'wide' | 'compact';

export class UiLayoutStore {
  state: UiLayoutState = 'wide';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isCompact(): boolean {
    return this.state === 'compact';
  }

  setCompact(compact: boolean): void {
    this.state = compact ? 'compact' : 'wide';
  }
}
