import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { VolumeOffIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreScreenSoundRoot } from './styled-components';

// Nobody has clicked on the page yet, so the browser keeps the sound off: the video plays muted and in
// step, and the first click anywhere turns the sound on.
export const RoomTheatreScreenSound = observer(function RoomTheatreScreenSound(): ReactElement {
  const { locale } = useRootStore();

  return (
    <RoomTheatreScreenSoundRoot role="status">
      <VolumeOffIcon />
      {locale.t('screen.soundOff')}
    </RoomTheatreScreenSoundRoot>
  );
});
