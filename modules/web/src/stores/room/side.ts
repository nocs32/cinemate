import { makeAutoObservable } from 'mobx';

export const sideTabs = ['queue', 'chat', 'played'] as const;

export type SideTab = (typeof sideTabs)[number];

export interface RoomSideDeps {
  // The chat was opened: its lines are read now.
  readChat: () => void;
}

// The sidebar's tab (the style board): what's up next, the chat, or what played tonight.
export class RoomSideStore {
  tab: SideTab = 'queue';
  readonly #deps: RoomSideDeps;

  constructor(deps: RoomSideDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isChatOpen(): boolean {
    return this.tab === 'chat';
  }

  show(tab: string): void {
    const next = sideTabs.find((candidate) => candidate === tab);

    if (!next) return;

    this.tab = next;

    if (next === 'chat') this.#deps.readChat();
  }
}
