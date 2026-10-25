import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTheatreSeatsItem } from './seats-item';
import { RoomTheatreSeatsRoot } from './styled-components';

// The row of seats under the screen: everyone in the room, with how their player is doing.
export const RoomTheatreSeats = observer(function RoomTheatreSeats(): ReactElement {
  const { locale, room, ui } = useRootStore();

  return (
    <RoomTheatreSeatsRoot aria-label={locale.t('seats.label')} dimmed={room.lights.isDown} compact={ui.layout.isCompact}>
      {room.presence.views.map((view) => (
        <RoomTheatreSeatsItem key={view.id} view={view} compact={ui.layout.isCompact} youLabel={locale.t('seats.you')} />
      ))}
    </RoomTheatreSeatsRoot>
  );
});
