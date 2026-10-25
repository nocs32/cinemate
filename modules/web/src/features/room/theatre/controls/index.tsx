import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PauseIcon, PlayIcon, RotateCcwIcon, RotateCwIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { IconButton } from '../../../../ui';
import { RoomTheatreControlsMine } from './mine';
import { RoomTheatreControlsScrub } from './scrub';
import { RoomTheatreControlsPlay, RoomTheatreControlsRoot, RoomTheatreControlsTime, RoomTheatreControlsTimeNow } from './styled-components';

// The bar under a file's video (the style board): on the left what's for everyone, on the right
// what's just for you (D8).
export const RoomTheatreControls = observer(function RoomTheatreControls(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { controls } = room;

  return (
    <RoomTheatreControlsRoot dimmed={room.lights.isDown} compact={ui.layout.isCompact}>
      <RoomTheatreControlsPlay type="button" onClick={controls.togglePlay} aria-label={controls.playLabel} title={controls.playLabel}>
        {controls.isPlaying ? <PauseIcon /> : <PlayIcon />}
      </RoomTheatreControlsPlay>
      {!ui.layout.isCompact && (
        <>
          <IconButton type="button" onClick={controls.back} aria-label={locale.t('controls.back')} title={locale.t('controls.back')}>
            <RotateCcwIcon />
          </IconButton>
          <IconButton type="button" onClick={controls.forward} aria-label={locale.t('controls.forward')} title={locale.t('controls.forward')}>
            <RotateCwIcon />
          </IconButton>
        </>
      )}
      <RoomTheatreControlsTime>
        <RoomTheatreControlsTimeNow>{controls.positionLabel}</RoomTheatreControlsTimeNow> / {controls.durationLabel}
      </RoomTheatreControlsTime>
      <RoomTheatreControlsScrub />
      <RoomTheatreControlsMine />
    </RoomTheatreControlsRoot>
  );
});
