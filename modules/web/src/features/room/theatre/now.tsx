import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { SkipForwardIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { OutlineButton } from '../../../ui';
import { RoomTheatreNowMeta, RoomTheatreNowRoot, RoomTheatreNowTitle } from './styled-components';

// What's on, who added it, and "Play next now" for everyone.
export const RoomTheatreNow = observer(function RoomTheatreNow(): ReactElement {
  const { locale, room } = useRootStore();
  const { screen } = room;

  return (
    <RoomTheatreNowRoot dimmed={room.lights.isDown}>
      <RoomTheatreNowTitle title={screen.title}>{screen.title}</RoomTheatreNowTitle>
      <RoomTheatreNowMeta>{screen.metaLabel}</RoomTheatreNowMeta>
      <OutlineButton type="button" size="sm" onClick={screen.skip} title={locale.t('now.nextHint')}>
        <SkipForwardIcon />
        {locale.t('now.next')}
      </OutlineButton>
    </RoomTheatreNowRoot>
  );
});
