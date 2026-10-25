import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreScreenFlightsItem } from './flights-item';
import { RoomTheatreScreenFlightsRoot } from './styled-components';

// Reactions floating up over the screen, on everyone's.
export const RoomTheatreScreenFlights = observer(function RoomTheatreScreenFlights(): ReactElement {
  const { reactions } = useRootStore().room;

  return (
    <RoomTheatreScreenFlightsRoot aria-hidden>
      {reactions.flights.map((flight) => (
        <RoomTheatreScreenFlightsItem key={flight.id} flight={flight} onLand={reactions.land} />
      ))}
    </RoomTheatreScreenFlightsRoot>
  );
});
