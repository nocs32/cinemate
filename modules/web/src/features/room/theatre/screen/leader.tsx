import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreScreenLeaderHand, RoomTheatreScreenLeaderLabel, RoomTheatreScreenLeaderNumber, RoomTheatreScreenLeaderRing, RoomTheatreScreenLeaderRoot, RoomTheatreScreenScrim } from './styled-components';

// The film leader (the style board): 3, 2, 1, and everyone starts on the same frame.
export const RoomTheatreScreenLeader = observer(function RoomTheatreScreenLeader(): ReactElement {
  const { screen } = useRootStore().room;

  return (
    <RoomTheatreScreenScrim>
      <RoomTheatreScreenLeaderRoot role="status">
        <RoomTheatreScreenLeaderRing>
          <RoomTheatreScreenLeaderHand />
          <RoomTheatreScreenLeaderNumber key={screen.leaderNumber}>{screen.leaderNumber}</RoomTheatreScreenLeaderNumber>
        </RoomTheatreScreenLeaderRing>
        <RoomTheatreScreenLeaderLabel>{screen.leaderLabel}</RoomTheatreScreenLeaderLabel>
      </RoomTheatreScreenLeaderRoot>
    </RoomTheatreScreenScrim>
  );
});
