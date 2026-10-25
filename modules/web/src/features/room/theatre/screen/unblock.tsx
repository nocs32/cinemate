import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PlayIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { LampButton } from '../../../../ui';
import { RoomTheatreScreenScrim, RoomTheatreScreenUnblockRoot, RoomTheatreScreenUnblockText } from './styled-components';

// The browser stopped the video from starting with sound: one click here starts this person's player.
export const RoomTheatreScreenUnblock = observer(function RoomTheatreScreenUnblock(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomTheatreScreenScrim>
      <RoomTheatreScreenUnblockRoot>
        <RoomTheatreScreenUnblockText>{locale.t('screen.unblock.text')}</RoomTheatreScreenUnblockText>
        <LampButton type="button" size="lg" onClick={room.driver.unblock}>
          <PlayIcon />
          {locale.t('screen.unblock.button')}
        </LampButton>
      </RoomTheatreScreenUnblockRoot>
    </RoomTheatreScreenScrim>
  );
});
