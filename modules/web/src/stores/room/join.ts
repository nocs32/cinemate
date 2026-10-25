import { cleanPersonName, personNameMaxLength, viewerColors } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import type { PreferencesService } from '../../services';
import type { Translate } from '../locale';
import type { RoomPresenceStore } from './presence';
import { colorSwatches, type ColorSwatchView } from './swatches';
import type { CinemaSend, ViewerColor } from './types';

export interface RoomJoinDeps {
  t: Translate;
  presence: RoomPresenceStore;
  preferences: PreferencesService;
  send: CinemaSend;
  // What's on screen, for the card's "4 people are watching…".
  nowShowing: () => string | null;
}

// The join card (spec §9) for someone who opened a room link for the first time: their name and
// colour, then Join. Both are saved in this browser, so next time they come straight in (and change
// them from their seat). States: open (typing) → entering (sent) → closed once the room says they're in.
export class RoomJoinStore {
  state: 'open' | 'entering' = 'open';
  // null until they type: then the field shows their saved or given name. Public fields, so MobX
  // watches them (it doesn't see # fields).
  draft: string | null = null;
  picked: ViewerColor | null = null;
  // Joined a room in this browser before: no card, their saved name and colour.
  readonly #returning: boolean;
  // Their saved colour has been asked for, in this room.
  #settled = false;
  readonly #deps: RoomJoinDeps;

  constructor(deps: RoomJoinDeps) {
    this.#deps = deps;
    this.picked = deps.preferences.loadColor();
    this.#returning = deps.preferences.loadName() !== null;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isShown(): boolean {
    const { me } = this.#deps.presence;

    return me !== undefined && !me.entered && this.state === 'open' && !this.#returning;
  }

  get name(): string {
    return this.draft ?? this.#deps.presence.me?.name ?? '';
  }

  get maxLength(): number {
    return personNameMaxLength;
  }

  // Their saved colour if nobody wears it, else the one the room gave them.
  get color(): ViewerColor {
    const taken = this.#deps.presence.takenColors;

    if (this.picked && !taken.has(this.picked)) return this.picked;

    return this.#deps.presence.me?.color ?? viewerColors.find((color) => !taken.has(color)) ?? 'teal';
  }

  get swatches(): ColorSwatchView[] {
    return colorSwatches(this.color, this.#deps.presence.takenColors, this.#deps.t);
  }

  get hasTakenColors(): boolean {
    return this.#deps.presence.takenColors.size > 0;
  }

  get canEnter(): boolean {
    return cleanPersonName(this.name).length > 0;
  }

  get watchingLabel(): string {
    const { t, presence, nowShowing } = this.#deps;
    const count = presence.watching.length;
    const title = nowShowing();

    if (count === 0) return t('join.empty');

    return title ? t('join.watching', { count, title }) : t('join.here', { count });
  }

  // The first look at the room: someone who joined before comes straight in, and whoever opened the
  // room from the start page gets their saved colour.
  receive(): void {
    const { me } = this.#deps.presence;

    if (!me || this.#settled) return;

    this.#settled = true;

    if (!me.entered) {
      if (this.#returning) this.enter();

      return;
    }

    if (this.color !== me.color) this.#deps.send('recolor', { color: this.color });
  }

  setName(text: string): void {
    this.draft = text.slice(0, personNameMaxLength);
  }

  pick(color: ViewerColor): void {
    if (!this.#deps.presence.takenColors.has(color)) this.picked = color;
  }

  enter(): void {
    const { presence, preferences, send } = this.#deps;
    const name = cleanPersonName(this.name);
    const { me } = presence;

    if (this.state !== 'open' || !name || !me) return;

    preferences.saveName(name);
    preferences.saveColor(this.color);
    presence.dress(me.id, name, this.color);
    send('enter', { name, color: this.color });
    this.state = 'entering';
  }

  // The room turned the colour down (someone took it a moment before): pick again.
  refuse(): void {
    this.picked = null;
    this.state = 'open';
  }
}
