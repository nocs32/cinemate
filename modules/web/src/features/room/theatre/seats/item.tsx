import type { ReactElement } from 'react';
import type { ViewerView } from '../../../../stores/room/presence';
import { RoomTheatreSeatsSeat } from './seat';
import { RoomTheatreSeatsItemRoot } from './styled-components';

interface RoomTheatreSeatsItemProps {
  view: ViewerView;
  compact: boolean;
}

// Someone else's seat.
export function RoomTheatreSeatsItem({ view, compact }: RoomTheatreSeatsItemProps): ReactElement {
  return (
    <RoomTheatreSeatsItemRoot compact={compact} title={view.title}>
      <RoomTheatreSeatsSeat view={view} compact={compact} youLabel="" />
    </RoomTheatreSeatsItemRoot>
  );
}
