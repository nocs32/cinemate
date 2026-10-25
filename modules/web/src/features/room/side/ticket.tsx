import type { ReactElement } from 'react';
import { CloseIcon, FilmIcon, RotateCcwIcon } from '../../../assets';
import type { TicketView } from '../../../stores/room/queue';
import {
  RoomSideTicketAction,
  RoomSideTicketBy,
  RoomSideTicketInfo,
  RoomSideTicketMeta,
  RoomSideTicketPosition,
  RoomSideTicketRoot,
  RoomSideTicketThumb,
  RoomSideTicketTitle,
} from './styled-components';
import { RoomSideTicketRemoveNow } from './ticket-remove-now';

interface RoomSideTicketProps {
  ticket: TicketView;
  draggable: boolean;
  // Played tonight: the whole ticket puts it back in the queue.
  played?: boolean;
  compact: boolean;
  actionLabel: string;
  onAction: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
}

// A video as a ticket (spec §6): its place in line by the tear-off notches ("Now" for the one on
// screen), its thumbnail, title, length and who added it.
export function RoomSideTicket({ ticket, draggable, played = false, compact, actionLabel, onAction, onDragStart, onDrop, onDragEnd }: RoomSideTicketProps): ReactElement {
  return (
    <RoomSideTicketRoot
      next={ticket.isNext}
      now={ticket.isNow}
      dragged={ticket.isDragged}
      played={played}
      compact={compact}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <RoomSideTicketPosition>{ticket.position}</RoomSideTicketPosition>
      <RoomSideTicketThumb compact={compact}>{ticket.thumbnail ? <img src={ticket.thumbnail} alt="" draggable={false} /> : <FilmIcon />}</RoomSideTicketThumb>
      <RoomSideTicketInfo>
        <RoomSideTicketTitle title={ticket.title}>{ticket.title}</RoomSideTicketTitle>
        <RoomSideTicketMeta compact={compact}>
          <span>{ticket.lengthLabel}</span>
          <RoomSideTicketBy tone={ticket.addedByColor}>{ticket.addedByName}</RoomSideTicketBy>
        </RoomSideTicketMeta>
      </RoomSideTicketInfo>
      {ticket.isNow ? (
        <RoomSideTicketRemoveNow />
      ) : (
        <RoomSideTicketAction type="button" onClick={onAction} aria-label={actionLabel} title={actionLabel} cover={played}>
          {played ? <RotateCcwIcon /> : <CloseIcon />}
        </RoomSideTicketAction>
      )}
    </RoomSideTicketRoot>
  );
}
