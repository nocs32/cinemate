import type { Services } from '../../services';
import { UiLayoutStore } from './layout';
import { UiNoticeStore } from './notice';

// This browser's own UI state: never shared with the room.
export class UiStore {
  readonly layout = new UiLayoutStore();
  readonly notice: UiNoticeStore;

  constructor(services: Services) {
    this.notice = new UiNoticeStore({ schedule: services.schedule });
  }
}
