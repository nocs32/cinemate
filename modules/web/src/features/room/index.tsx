import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomJoin } from './join';
import { RoomLanding } from './landing';
import { RoomSide } from './side';
import { RoomStatus } from './status';
import { RoomMain, RoomRoot } from './styled-components';
import { RoomTheatre } from './theatre';
import { RoomTopBar } from './top-bar';

// The whole page (spec §9, the style board): the top bar, the theatre (the screen, its controls and
// the row of seats) beside the sidebar (the queue, the chat, what played), and the join card over it
// all for someone who came in by link. The start page and a status card stand in when there's no room.
export const Room = observer(function Room(): ReactElement {
  const { room, ui } = useRootStore();

  if (room.connection.isLanding) return <RoomLanding />;

  if (!room.isOpen) return <RoomStatus />;

  return (
    <RoomRoot compact={ui.layout.isCompact}>
      <RoomTopBar />
      <RoomMain compact={ui.layout.isCompact}>
        <RoomTheatre />
        <RoomSide />
      </RoomMain>
      {room.join.isShown && <RoomJoin />}
    </RoomRoot>
  );
});
