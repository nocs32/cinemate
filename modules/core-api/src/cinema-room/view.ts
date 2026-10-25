import type { Cinema } from '@cinemate/engine';
import type { CinemaViewEvent, MemberSnapshot } from '@cinemate/protocol';
import type { CinemaRoomMember } from './members.js';

// The room as everyone sees it (nothing in a room is secret): people with how their player is doing,
// the playback record, the queue and tonight's history. The outbox adds the server's clock.
export type CinemaRoomView = Omit<CinemaViewEvent, 'now'>;

export interface CinemaRoomViewParts {
  members: readonly CinemaRoomMember[];
  cinema: Cinema;
  now: number;
}

const toMember = (member: CinemaRoomMember, cinema: Cinema, now: number): MemberSnapshot => {
  const state = cinema.member(member.id, now);

  return {
    id: member.id,
    name: member.name,
    color: member.color,
    connected: member.connected,
    entered: state?.entered ?? false,
    status: state?.status ?? 'joining',
    offsetMs: state?.offsetMs ?? null,
    slowpokes: state?.slowpokes ?? 0,
    watchFps: state?.watchFps ?? null,
  };
};

export const cinemaView = ({ members, cinema, now }: CinemaRoomViewParts): CinemaRoomView => ({
  members: members.map((member) => toMember(member, cinema, now)),
  ...cinema.view(),
});
