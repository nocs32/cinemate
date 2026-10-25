import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreSeatsItem } from './item';
import { RoomTheatreSeatsMine } from './mine';
import { RoomTheatreSeatsRoot } from './styled-components';

// The row of seats under the screen: everyone in the room, with how their player is doing. Your own
// seat opens a popup to change your name and colour.
export const RoomTheatreSeats = observer(function RoomTheatreSeats(): ReactElement {
  const { locale, room, ui } = useRootStore();

  return (
    <RoomTheatreSeatsRoot aria-label={locale.t('seats.label')} dimmed={room.lights.isDown} compact={ui.layout.isCompact}>
      {room.presence.views.map((view) =>
        view.isMe ? <RoomTheatreSeatsMine key={view.id} view={view} /> : <RoomTheatreSeatsItem key={view.id} view={view} compact={ui.layout.isCompact} />,
      )}
    </RoomTheatreSeatsRoot>
  );
});
