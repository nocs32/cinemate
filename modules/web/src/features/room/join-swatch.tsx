import type { ReactElement } from 'react';
import type { JoinSwatch } from '../../stores/room/join';
import type { ViewerColor } from '../../stores/room/types';
import { RoomJoinSwatchButton } from './styled-components';

interface RoomJoinSwatchProps {
  swatch: JoinSwatch;
  onPick: (color: ViewerColor) => void;
}

export function RoomJoinSwatch({ swatch, onPick }: RoomJoinSwatchProps): ReactElement {
  return (
    <RoomJoinSwatchButton
      type="button"
      tone={swatch.color}
      picked={swatch.isPicked}
      disabled={swatch.isTaken}
      aria-pressed={swatch.isPicked}
      aria-label={swatch.label}
      title={swatch.label}
      onClick={() => onPick(swatch.color)}
    />
  );
}
