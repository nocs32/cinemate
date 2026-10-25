import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreScreenLiveLayer, RoomTheatreScreenLiveTag } from './styled-components';
import { useRoomTheatreScreenLive } from './use-live';

// A live share (spec §14.1) over the paused player: the picture, and "Live · Anna" in the corner. The
// layer stays on the page (hidden) so the live screen is ready the moment someone shares.
export const RoomTheatreScreenLive = observer(function RoomTheatreScreenLive(): ReactElement {
  const { live } = useRootStore().room;
  const layerRef = useRoomTheatreScreenLive(live);

  return (
    <>
      <RoomTheatreScreenLiveLayer ref={layerRef} hidden={!live.isOn} />
      {live.isOn && <RoomTheatreScreenLiveTag>{live.tagLabel}</RoomTheatreScreenLiveTag>}
    </>
  );
});
