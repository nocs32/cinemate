import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton } from '../../../ui';
import { RoomTheatreLiveMine } from './live-mine';
import { RoomTheatreLiveSharer } from './live-sharer';
import { RoomTheatreLiveNote, RoomTheatreLiveProblem, RoomTheatreLiveRoot } from './styled-components';

// Under the screen while someone shares (spec §14.1): what it means for the room, then the sharer's
// tools (quality, sound, Stop sharing) or everyone else's own sound and fullscreen. A share that didn't
// work out says why here too.
export const RoomTheatreLive = observer(function RoomTheatreLive(): ReactElement {
  const { locale, room } = useRootStore();
  const { live } = room;
  const { sharer } = live;

  return (
    <RoomTheatreLiveRoot dimmed={room.lights.isDown}>
      {sharer.problem ? (
        <RoomTheatreLiveProblem role="status">
          {sharer.problemLabel}
          <IconButton type="button" onClick={sharer.dismissProblem} aria-label={locale.t('live.problem.dismiss')} title={locale.t('live.problem.dismiss')}>
            <CloseIcon />
          </IconButton>
        </RoomTheatreLiveProblem>
      ) : (
        live.isOn && <RoomTheatreLiveNote>{live.noteLabel}</RoomTheatreLiveNote>
      )}
      {live.isMine && <RoomTheatreLiveSharer />}
      {live.isOn && !live.isMine && <RoomTheatreLiveMine />}
    </RoomTheatreLiveRoot>
  );
});
