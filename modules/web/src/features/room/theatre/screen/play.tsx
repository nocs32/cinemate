import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PlayIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreScreenPlayButton, RoomTheatreScreenPlayCircle, RoomTheatreScreenPlayLabel, RoomTheatreScreenPlayRoot } from './styled-components';

// Over a paused video (a new one loads paused): one big button that plays it for everyone.
export const RoomTheatreScreenPlay = observer(function RoomTheatreScreenPlay(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomTheatreScreenPlayRoot>
      <RoomTheatreScreenPlayButton type="button" onClick={room.controls.togglePlay}>
        <RoomTheatreScreenPlayCircle>
          <PlayIcon />
        </RoomTheatreScreenPlayCircle>
        <RoomTheatreScreenPlayLabel>{locale.t('controls.play')}</RoomTheatreScreenPlayLabel>
      </RoomTheatreScreenPlayButton>
    </RoomTheatreScreenPlayRoot>
  );
});
