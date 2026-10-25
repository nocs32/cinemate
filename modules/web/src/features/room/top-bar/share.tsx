import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ScreenShareIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarShareButton } from './styled-components';

// Share a tab or your screen with the room (spec §14.1), or stop sharing. Waits while someone else shares.
export const RoomTopBarShare = observer(function RoomTopBarShare(): ReactElement {
  const { room, ui } = useRootStore();
  const { sharer } = room.live;

  return (
    <RoomTopBarShareButton type="button" onClick={sharer.toggle} disabled={sharer.isBlocked} title={sharer.buttonHint} aria-label={sharer.buttonLabel} live={sharer.isSharing} compact={ui.layout.isCompact}>
      <ScreenShareIcon />
      {!ui.layout.isCompact && sharer.buttonLabel}
    </RoomTopBarShareButton>
  );
});
