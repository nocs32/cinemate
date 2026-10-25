import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreScreenCatchingUp } from './catching-up';
import { RoomTheatreScreenEmpty } from './empty';
import { RoomTheatreScreenFlights } from './flights';
import { RoomTheatreScreenLeader } from './leader';
import { RoomTheatreScreenSlate } from './slate';
import { RoomTheatreScreenFrame, RoomTheatreScreenPlayer, RoomTheatreScreenSpill, RoomTheatreScreenWrap } from './styled-components';
import { RoomTheatreScreenUnblock } from './unblock';
import { RoomTheatreScreenUpNext } from './up-next';
import { useRoomTheatreScreenFrame } from './use-frame';
import { useRoomTheatreScreenPlayer } from './use-player';

// The screen (spec §9, the style board): the player, the light from the frame spilling onto the wall
// around it, and whatever is drawn over it: the empty room, the waiting slate, the film leader, "Up
// next", reactions.
export const RoomTheatreScreen = observer(function RoomTheatreScreen(): ReactElement {
  const { locale, room } = useRootStore();
  const { screen, driver, controls, lights } = room;
  const playerRef = useRoomTheatreScreenPlayer(driver);
  const frameRef = useRoomTheatreScreenFrame(controls);
  const { overlay } = screen;

  return (
    <RoomTheatreScreenWrap>
      {screen.thumbnail && screen.hasVideo && <RoomTheatreScreenSpill src={screen.thumbnail} alt="" bright={lights.isDown} />}
      <RoomTheatreScreenFrame ref={frameRef} aria-label={locale.t('screen.label')} bare={overlay === 'empty' || overlay === 'ended'}>
        <RoomTheatreScreenPlayer ref={playerRef} hidden={!screen.hasVideo} />
        {(overlay === 'empty' || overlay === 'ended') && <RoomTheatreScreenEmpty />}
        {overlay === 'upNext' && <RoomTheatreScreenUpNext />}
        {overlay === 'waiting' && <RoomTheatreScreenSlate />}
        {overlay === 'leader' && <RoomTheatreScreenLeader />}
        {overlay === 'none' && screen.isCatchingUp && <RoomTheatreScreenCatchingUp />}
        {driver.needsClick && <RoomTheatreScreenUnblock />}
        <RoomTheatreScreenFlights />
      </RoomTheatreScreenFrame>
    </RoomTheatreScreenWrap>
  );
});
