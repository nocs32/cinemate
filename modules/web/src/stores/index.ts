import { createServices } from '../services';
import type { Services } from '../services/types';
import { LocaleStore } from './locale';

export class RootStore {
  readonly locale: LocaleStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());
