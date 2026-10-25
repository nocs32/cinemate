import { viewerColors } from '@cinemate/protocol';
import type { Translate } from '../locale';
import type { ViewerColor } from './types';

// One colour to pick from, on the join card and in your seat's popup.
export interface ColorSwatchView {
  color: ViewerColor;
  isPicked: boolean;
  isTaken: boolean;
  // Who wears it already: their initial shows on it.
  initial: string | null;
  label: string;
}

// Every colour: the one picked, and the ones other people wear (with who), which can't be picked.
export const colorSwatches = (picked: ViewerColor, taken: ReadonlyMap<ViewerColor, string>, t: Translate): ColorSwatchView[] =>
  viewerColors.map((color) => {
    const holder = taken.get(color);

    return {
      color,
      isPicked: color === picked,
      isTaken: holder !== undefined,
      initial: holder ? holder.charAt(0).toUpperCase() : null,
      label: holder ? t('join.colorTaken', { name: holder }) : t(`colors.${color}`),
    };
  });
