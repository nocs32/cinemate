import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import type { ColorSwatchView } from '../../stores/room/swatches';
import type { ViewerColor } from '../../stores/room/types';
import { ColorPickerSwatch } from './color-picker-swatch';
import { ColorPickerHint, ColorPickerList } from './styled-components';

interface ColorPickerProps {
  swatches: ColorSwatchView[];
  onPick: (color: ViewerColor) => void;
  // Some are taken: a line says the letters on them are who wears them.
  hasTaken: boolean;
}

// Your colour, on the join card and in your seat's popup. Colours others wear show their initial.
export const ColorPicker = observer(function ColorPicker({ swatches, onPick, hasTaken }: ColorPickerProps): ReactElement {
  const { locale } = useRootStore();

  return (
    <>
      <ColorPickerList role="radiogroup" aria-label={locale.t('join.color')}>
        {swatches.map((swatch) => (
          <ColorPickerSwatch key={swatch.color} swatch={swatch} onPick={onPick} />
        ))}
      </ColorPickerList>
      {hasTaken && <ColorPickerHint>{locale.t('join.takenHint')}</ColorPickerHint>}
    </>
  );
});
