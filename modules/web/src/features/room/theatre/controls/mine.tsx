import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { MaximizeIcon, MinimizeIcon, VolumeIcon, VolumeOffIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { IconButton } from '../../../../ui';
import { RoomTheatreControlsQuality } from './quality';
import { RoomTheatreControlsMineLabel, RoomTheatreControlsMineRoot, RoomTheatreControlsRange } from './styled-components';
import { useRoomTheatreControlsFill } from './use-fill';

// "Just for you" (D8): volume, quality and fullscreen never reach anyone else.
export const RoomTheatreControlsMine = observer(function RoomTheatreControlsMine(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { controls } = room;
  const ref = useRoomTheatreControlsFill(controls.volumeFill);

  return (
    <RoomTheatreControlsMineRoot>
      {!ui.layout.isCompact && <RoomTheatreControlsMineLabel>{locale.t('controls.mine')}</RoomTheatreControlsMineLabel>}
      <IconButton type="button" onClick={controls.toggleMute} aria-label={controls.volumeLabel} title={controls.volumeLabel}>
        {controls.isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
      </IconButton>
      {!ui.layout.isCompact && (
        <RoomTheatreControlsRange
          ref={ref}
          type="range"
          kind="volume"
          min={0}
          max={100}
          value={controls.volumeValue}
          aria-label={locale.t('controls.volume')}
          title={locale.t('controls.volume')}
          onChange={(event) => controls.setVolume(Number(event.target.value))}
        />
      )}
      <RoomTheatreControlsQuality />
      <IconButton type="button" onClick={controls.toggleFullscreen} aria-label={controls.fullscreenLabel} title={controls.fullscreenLabel}>
        {controls.isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
      </IconButton>
    </RoomTheatreControlsMineRoot>
  );
});
