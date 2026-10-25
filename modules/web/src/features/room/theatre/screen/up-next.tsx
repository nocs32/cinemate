import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { FilmIcon, PauseIcon, PlayIcon, SkipForwardIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { LampButton, OutlineButton } from '../../../../ui';
import {
  RoomTheatreScreenScrim,
  RoomTheatreScreenUpNextActions,
  RoomTheatreScreenUpNextEyebrow,
  RoomTheatreScreenUpNextLabel,
  RoomTheatreScreenUpNextPoster,
  RoomTheatreScreenUpNextRoot,
  RoomTheatreScreenUpNextTitle,
} from './styled-components';

// Between videos (D18): what's next, a 5-second count anyone can hold, and "Play it now".
export const RoomTheatreScreenUpNext = observer(function RoomTheatreScreenUpNext(): ReactElement {
  const { locale, room } = useRootStore();
  const { screen } = room;

  return (
    <RoomTheatreScreenScrim>
      <RoomTheatreScreenUpNextRoot role="status">
        <RoomTheatreScreenUpNextPoster>{screen.upNextThumbnail ? <img src={screen.upNextThumbnail} alt="" /> : <FilmIcon />}</RoomTheatreScreenUpNextPoster>
        <div>
          <RoomTheatreScreenUpNextEyebrow>{locale.t('screen.upNext.title')}</RoomTheatreScreenUpNextEyebrow>
          <RoomTheatreScreenUpNextTitle>{screen.upNextTitle}</RoomTheatreScreenUpNextTitle>
          <RoomTheatreScreenUpNextLabel>{screen.upNextLabel}</RoomTheatreScreenUpNextLabel>
          <RoomTheatreScreenUpNextActions>
            <LampButton type="button" onClick={screen.skip} title={locale.t('screen.upNext.nowHint')}>
              <SkipForwardIcon />
              {locale.t('screen.upNext.now')}
            </LampButton>
            <OutlineButton type="button" onClick={screen.toggleUpNext} title={locale.t('screen.upNext.holdHint')}>
              {screen.isUpNextHeld ? <PlayIcon /> : <PauseIcon />}
              {locale.t(screen.isUpNextHeld ? 'screen.upNext.release' : 'screen.upNext.hold')}
            </OutlineButton>
          </RoomTheatreScreenUpNextActions>
        </div>
      </RoomTheatreScreenUpNextRoot>
    </RoomTheatreScreenScrim>
  );
});
