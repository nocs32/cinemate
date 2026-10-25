import type { ReactElement } from 'react';
import { SeatShape } from '../../../../assets';
import type { ViewerView } from '../../../../stores/room/presence';
import { RoomTheatreSeatsSeatInitial, RoomTheatreSeatsSeatName, RoomTheatreSeatsSeatShape, RoomTheatreSeatsSeatStatus, RoomTheatreSeatsSeatTally } from './styled-components';

interface RoomTheatreSeatsSeatProps {
  view: ViewerView;
  compact: boolean;
  // "(you)" after your own name; empty for everyone else.
  youLabel: string;
}

// A seat: the person's colour and initial, their name, their player's status, and how often they've
// kept the room waiting tonight. While someone shares, the status is how many frames a second they see (D31).
export function RoomTheatreSeatsSeat({ view, compact, youLabel }: RoomTheatreSeatsSeatProps): ReactElement {
  return (
    <>
      {view.slowpokes > 0 && <RoomTheatreSeatsSeatTally title={view.tallyTitle}>{view.tallyLabel}</RoomTheatreSeatsSeatTally>}
      <RoomTheatreSeatsSeatShape tone={view.color} away={view.isAway}>
        <SeatShape />
        <RoomTheatreSeatsSeatInitial>{view.initial}</RoomTheatreSeatsSeatInitial>
      </RoomTheatreSeatsSeatShape>
      <RoomTheatreSeatsSeatName>
        {view.name}
        {youLabel && !compact && ` ${youLabel}`}
      </RoomTheatreSeatsSeatName>
      {!compact && !view.fpsLabel && <RoomTheatreSeatsSeatStatus tone={view.tone}>{view.statusLabel}</RoomTheatreSeatsSeatStatus>}
      {!compact && view.fpsLabel && (
        <RoomTheatreSeatsSeatStatus tone={view.fpsTone} title={view.fpsTitle}>
          {view.fpsLabel}
        </RoomTheatreSeatsSeatStatus>
      )}
    </>
  );
}
