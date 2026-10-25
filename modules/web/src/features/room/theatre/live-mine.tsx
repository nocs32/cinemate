import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { MaximizeIcon, MinimizeIcon, VolumeIcon, VolumeOffIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton } from '../../../ui';
import { RoomTheatreControlsRange } from './controls/styled-components';
import { useRoomTheatreControlsFill } from './controls/use-fill';
import { RoomTheatreLiveTools } from './styled-components';

// A viewer's own sound and fullscreen while someone shares (D8): the same volume as for videos.
export const RoomTheatreLiveMine = observer(function RoomTheatreLiveMine(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { controls } = room;
  const ref = useRoomTheatreControlsFill(controls.volumeFill);

  return (
    <RoomTheatreLiveTools>
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
      <IconButton type="button" onClick={controls.toggleFullscreen} aria-label={controls.fullscreenLabel} title={controls.fullscreenLabel}>
        {controls.isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
      </IconButton>
    </RoomTheatreLiveTools>
  );
});
