import { liveLimits, type MemberSnapshot, type ViewerStatus } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { StatusTone, ViewerColor } from './types';

// Someone in the room, as the seats, the chat and the waiting slate show them.
export interface ViewerView {
  id: string;
  name: string;
  initial: string;
  color: ViewerColor;
  isMe: boolean;
  entered: boolean;
  status: ViewerStatus;
  statusLabel: string;
  tone: StatusTone;
  // Not watching yet, or gone for a moment: the seat shows faded.
  isAway: boolean;
  // "Dima: Buffering", on pointing at the seat.
  title: string;
  // Times they kept the room waiting tonight (D11), and what the little badge says about it.
  slowpokes: number;
  tallyLabel: string;
  tallyTitle: string;
  // While someone shares: "58 fps", and whether that's smooth (D31). Empty when there's no share.
  fpsLabel: string;
  fpsTone: StatusTone;
  fpsTitle: string;
}

export interface RoomPresenceDeps {
  t: Translate;
}

const tones: Readonly<Record<ViewerStatus, StatusTone>> = {
  inSync: 'sync',
  ready: 'sync',
  behind: 'late',
  ahead: 'late',
  buffering: 'late',
  stuck: 'late',
  paused: 'late',
  loading: 'quiet',
  catchingUp: 'quiet',
  joining: 'quiet',
  reconnecting: 'quiet',
};

// Who is in the room, in the order they came in, and how each one's player is doing.
export class RoomPresenceStore {
  members: MemberSnapshot[] = [];
  meId = '';
  readonly #deps: RoomPresenceDeps;

  constructor(deps: RoomPresenceDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get views(): ViewerView[] {
    return this.members.map((member) => this.#toView(member));
  }

  get me(): ViewerView | undefined {
    return this.views.find((view) => view.isMe);
  }

  // People past the join card: the ones the room plays for.
  get watching(): ViewerView[] {
    return this.views.filter((view) => view.entered);
  }

  get countLabel(): string {
    return this.#deps.t('people.count', { count: this.members.length });
  }

  find(id: string): ViewerView | undefined {
    return this.views.find((view) => view.id === id);
  }

  // Colours someone other than you wears, with who wears them.
  get takenColors(): Map<ViewerColor, string> {
    return new Map(this.members.filter((member) => member.id !== this.meId).map((member) => [member.color, member.name]));
  }

  receive(members: MemberSnapshot[], meId: string): void {
    this.members = members;
    this.meId = meId;
  }

  // Shows a new name and colour before the room confirms them.
  dress(id: string, name: string, color: ViewerColor): void {
    this.members = this.members.map((member) => (member.id === id ? { ...member, name, color } : member));
  }

  #toView(member: MemberSnapshot): ViewerView {
    const { t } = this.#deps;
    const seconds = member.offsetMs === null ? '0' : (Math.abs(member.offsetMs) / 1000).toFixed(1);
    const statusLabel = t(`seats.status.${member.status}`, { seconds });

    return {
      id: member.id,
      name: member.name,
      initial: member.name.charAt(0).toUpperCase() || '?',
      color: member.color,
      isMe: member.id === this.meId,
      entered: member.entered,
      status: member.status,
      statusLabel,
      tone: tones[member.status],
      isAway: member.status === 'joining' || member.status === 'reconnecting',
      title: `${member.name}: ${statusLabel}`,
      slowpokes: member.slowpokes,
      tallyLabel: t('seats.tally', { count: member.slowpokes }),
      tallyTitle: t('seats.tallyTitle', { count: member.slowpokes }),
      fpsLabel: member.watchFps === null ? '' : t('seats.fps', { fps: member.watchFps }),
      fpsTone: member.watchFps !== null && member.watchFps < liveLimits.smoothFps ? 'late' : 'sync',
      fpsTitle: t('seats.fpsTitle'),
    };
  }
}
