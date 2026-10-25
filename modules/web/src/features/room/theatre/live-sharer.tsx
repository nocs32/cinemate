import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { VolumeIcon, VolumeOffIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton, OutlineButton } from '../../../ui';
import { RoomTheatreLiveQuality } from './live-quality';
import { RoomTheatreLiveTools } from './styled-components';

// The sharer's tools (D29, D32): the quality everyone gets, whether the sound goes out, and Stop sharing.
export const RoomTheatreLiveSharer = observer(function RoomTheatreLiveSharer(): ReactElement {
  const { locale, room } = useRootStore();
  const { sharer } = room.live;

  return (
    <RoomTheatreLiveTools>
      <RoomTheatreLiveQuality />
      {sharer.hasSound && (
        <IconButton type="button" onClick={sharer.toggleSound} aria-label={sharer.soundLabel} title={sharer.soundLabel}>
          {sharer.isSoundOn ? <VolumeIcon /> : <VolumeOffIcon />}
        </IconButton>
      )}
      <OutlineButton type="button" size="sm" onClick={sharer.stop} title={locale.t('live.stopHint')}>
        {locale.t('live.stop')}
      </OutlineButton>
    </RoomTheatreLiveTools>
  );
});
