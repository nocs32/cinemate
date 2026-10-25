import type { ReactElement } from 'react';
import type { ColorSwatchView } from '../../stores/room/swatches';
import type { ViewerColor } from '../../stores/room/types';
import { ColorPickerSwatchButton } from './styled-components';

interface ColorPickerSwatchProps {
  swatch: ColorSwatchView;
  onPick: (color: ViewerColor) => void;
}

export function ColorPickerSwatch({ swatch, onPick }: ColorPickerSwatchProps): ReactElement {
  return (
    <ColorPickerSwatchButton
      type="button"
      role="radio"
      tone={swatch.color}
      picked={swatch.isPicked}
      disabled={swatch.isTaken}
      aria-checked={swatch.isPicked}
      aria-label={swatch.label}
      title={swatch.label}
      onClick={() => onPick(swatch.color)}
    >
      {swatch.initial}
    </ColorPickerSwatchButton>
  );
}
