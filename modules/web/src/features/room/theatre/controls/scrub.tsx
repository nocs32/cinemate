import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreControlsRange } from './styled-components';
import { useRoomTheatreControlsFill } from './use-fill';

// The scrubber: drag to a moment, and everyone jumps there when you let go.
export const RoomTheatreControlsScrub = observer(function RoomTheatreControlsScrub(): ReactElement {
  const { locale, room } = useRootStore();
  const { controls } = room;
  const ref = useRoomTheatreControlsFill(controls.progress);

  return (
    <RoomTheatreControlsRange
      ref={ref}
      type="range"
      kind="scrub"
      min={0}
      max={controls.duration || 1}
      step={0.1}
      value={controls.position}
      disabled={!controls.canScrub}
      aria-label={locale.t('controls.scrub')}
      aria-valuetext={controls.positionLabel}
      title={locale.t('controls.scrub')}
      onChange={(event) => controls.scrub(Number(event.target.value))}
      onPointerUp={controls.commitScrub}
      onKeyUp={controls.commitScrub}
      onBlur={controls.commitScrub}
    />
  );
});
