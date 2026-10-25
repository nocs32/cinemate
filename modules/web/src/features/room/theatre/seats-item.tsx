import type { ReactElement } from 'react';
import { SeatShape } from '../../../assets';
import type { ViewerView } from '../../../stores/room/presence';
import {
  RoomTheatreSeatsItemInitial,
  RoomTheatreSeatsItemName,
  RoomTheatreSeatsItemRoot,
  RoomTheatreSeatsItemSeat,
  RoomTheatreSeatsItemStatus,
  RoomTheatreSeatsItemTally,
} from './styled-components';

interface RoomTheatreSeatsItemProps {
  view: ViewerView;
  compact: boolean;
  youLabel: string;
}

// One seat: the person's colour and initial, their name, their player's status, and how often they've
// kept the room waiting tonight.
export function RoomTheatreSeatsItem({ view, compact, youLabel }: RoomTheatreSeatsItemProps): ReactElement {
  return (
    <RoomTheatreSeatsItemRoot compact={compact} title={view.title}>
      {view.slowpokes > 0 && <RoomTheatreSeatsItemTally title={view.tallyTitle}>{view.tallyLabel}</RoomTheatreSeatsItemTally>}
      <RoomTheatreSeatsItemSeat tone={view.color} away={view.isAway}>
        <SeatShape />
        <RoomTheatreSeatsItemInitial>{view.initial}</RoomTheatreSeatsItemInitial>
      </RoomTheatreSeatsItemSeat>
      <RoomTheatreSeatsItemName>
        {view.name}
        {view.isMe && !compact && ` ${youLabel}`}
      </RoomTheatreSeatsItemName>
      {!compact && <RoomTheatreSeatsItemStatus tone={view.tone}>{view.statusLabel}</RoomTheatreSeatsItemStatus>}
    </RoomTheatreSeatsItemRoot>
  );
}
