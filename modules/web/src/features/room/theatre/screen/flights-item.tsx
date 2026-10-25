import type { ReactElement } from 'react';
import type { Flight } from '../../../../stores/room/reactions';
import { RoomTheatreScreenFlightsName, RoomTheatreScreenFlightsRise, RoomTheatreScreenFlightsSway } from './styled-components';

interface RoomTheatreScreenFlightsItemProps {
  flight: Flight;
  onLand: (id: string) => void;
}

export function RoomTheatreScreenFlightsItem({ flight, onLand }: RoomTheatreScreenFlightsItemProps): ReactElement {
  return (
    <RoomTheatreScreenFlightsRise lane={flight.lane} onAnimationEnd={() => onLand(flight.id)}>
      <RoomTheatreScreenFlightsSway sway={flight.sway}>
        {flight.emoji}
        {flight.sender && <RoomTheatreScreenFlightsName>{flight.sender}</RoomTheatreScreenFlightsName>}
      </RoomTheatreScreenFlightsSway>
    </RoomTheatreScreenFlightsRise>
  );
}
