import { cleanPersonName, personNameMaxLength } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import type { PreferencesService } from '../../services';
import type { Translate } from '../locale';
import type { RoomPresenceStore } from './presence';
import { colorSwatches, type ColorSwatchView } from './swatches';
import type { CinemaSend, ViewerColor } from './types';

export interface RoomProfileDeps {
  t: Translate;
  presence: RoomPresenceStore;
  preferences: PreferencesService;
  send: CinemaSend;
}

// Your name and colour, changed from your own seat (a popup). Saved in this browser for every room.
// States: closed ⇄ open (a draft of both).
export class RoomProfileStore {
  state: 'closed' | 'open' = 'closed';
  name = '';
  color: ViewerColor = 'teal';
  readonly #deps: RoomProfileDeps;

  constructor(deps: RoomProfileDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.state === 'open';
  }

  get maxLength(): number {
    return personNameMaxLength;
  }

  get swatches(): ColorSwatchView[] {
    return colorSwatches(this.color, this.#deps.presence.takenColors, this.#deps.t);
  }

  get hasTakenColors(): boolean {
    return this.#deps.presence.takenColors.size > 0;
  }

  get canSave(): boolean {
    return cleanPersonName(this.name).length > 0;
  }

  get editLabel(): string {
    return this.#deps.t('profile.edit');
  }

  toggle(open: boolean): void {
    if (open) this.open();
    else this.close();
  }

  open(): void {
    const { me } = this.#deps.presence;

    if (!me) return;

    this.name = me.name;
    this.color = me.color;
    this.state = 'open';
  }

  close(): void {
    this.state = 'closed';
  }

  setName(text: string): void {
    this.name = text.slice(0, personNameMaxLength);
  }

  pick(color: ViewerColor): void {
    if (!this.#deps.presence.takenColors.has(color)) this.color = color;
  }

  save(): void {
    const { presence, preferences, send } = this.#deps;
    const { me } = presence;
    const name = cleanPersonName(this.name);

    if (!me || !name) return;

    if (name !== me.name) send('rename', { name });

    if (this.color !== me.color) send('recolor', { color: this.color });

    preferences.saveName(name);
    preferences.saveColor(this.color);
    presence.dress(me.id, name, this.color);
    this.close();
  }
}
