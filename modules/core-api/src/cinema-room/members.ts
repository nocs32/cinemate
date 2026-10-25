import { cleanPersonName, viewerColors, type ViewerColor } from '@cinemate/protocol';
import { CinemaRoomError } from './error.js';
import { pickMemberName } from './member-names.js';

// Someone in the room, keyed by their session id. How their player is doing lives in the cinema.
export interface CinemaRoomMember {
  readonly id: string;
  name: string;
  color: ViewerColor;
  connected: boolean;
}

// Who is in the room, in the order they came in. Each person is connected ⇄ reconnecting (a dropped
// connection keeps their seat for a while), then leaves.
export class CinemaRoomMembers {
  readonly #members = new Map<string, CinemaRoomMember>();
  readonly #random: () => number;

  constructor(random: () => number) {
    this.#random = random;
  }

  get count(): number {
    return this.#members.size;
  }

  get all(): CinemaRoomMember[] {
    return [...this.#members.values()];
  }

  has(id: string): boolean {
    return this.#members.has(id);
  }

  find(id: string): CinemaRoomMember | undefined {
    return this.#members.get(id);
  }

  get(id: string): CinemaRoomMember {
    const member = this.#members.get(id);

    if (!member) throw new CinemaRoomError('NOT_A_MEMBER');

    return member;
  }

  // `requestedName` is the name this person picked before; without one the room makes one up.
  join(id: string, requestedName: string | null): CinemaRoomMember {
    if (this.#members.has(id)) throw new CinemaRoomError('ALREADY_A_MEMBER');

    const name = cleanPersonName(requestedName ?? '') || pickMemberName(new Set(this.all.map((member) => member.name)), this.#random);
    const member: CinemaRoomMember = { id, name, color: this.#freeColor(), connected: true };

    this.#members.set(id, member);

    return member;
  }

  drop(id: string): void {
    this.get(id).connected = false;
  }

  reconnect(id: string): void {
    this.get(id).connected = true;
  }

  leave(id: string): CinemaRoomMember {
    const member = this.get(id);

    this.#members.delete(id);

    return member;
  }

  // The cleaned-up name, or null when nothing changes. An empty one is refused.
  cleanName(id: string, text: string): string | null {
    const name = cleanPersonName(text);

    if (!name) throw new CinemaRoomError('EMPTY_NAME');

    return name === this.get(id).name ? null : name;
  }

  rename(id: string, name: string): void {
    this.get(id).name = name;
  }

  // A colour someone else wears is refused, and nothing changes.
  recolor(id: string, color: ViewerColor): void {
    const member = this.get(id);

    if (this.all.some((other) => other.id !== id && other.color === color)) throw new CinemaRoomError('COLOR_TAKEN');

    member.color = color;
  }

  // The least used colour (unused while there are fewer people than colours), random among ties.
  #freeColor(): ViewerColor {
    const uses = new Map<ViewerColor, number>(viewerColors.map((color) => [color, 0]));

    this.#members.forEach((member) => uses.set(member.color, (uses.get(member.color) ?? 0) + 1));

    const fewest = Math.min(...uses.values());
    const candidates = viewerColors.filter((color) => uses.get(color) === fewest);

    return candidates[Math.floor(this.#random() * candidates.length)] ?? 'teal';
  }
}
