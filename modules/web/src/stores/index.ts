import { createServices } from '../services';
import type { Services } from '../services/types';
import { LocaleStore } from './locale';
import { RoomStore } from './room';
import { UiStore } from './ui';

export class RootStore {
  readonly locale: LocaleStore;
  readonly ui: UiStore;
  readonly room: RoomStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
    this.ui = new UiStore(services);
    this.room = new RoomStore(services, this.locale);
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());
