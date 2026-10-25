import { Menu } from '@ark-ui/react/menu';
import { styled } from 'styled-system/jsx';

export const RoomTheatreControlsRoot = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '14px', minWidth: '0', transition: 'opacity 0.6s ease' },
  variants: {
    dimmed: { true: { opacity: '0.28' } },
    compact: { true: { gap: '8px' } },
  },
});

export const RoomTheatreControlsPlay = styled('button', {
  base: {
    width: '44px',
    height: '44px',
    flex: 'none',
    borderRadius: 'full',
    border: '0',
    bg: 'accent.default',
    color: 'accent.ink',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    '& svg': { width: '16px', height: '16px' },
  },
});

export const RoomTheatreControlsTime = styled('span', {
  base: { fontVariantNumeric: 'tabular-nums', fontSize: '14px', color: 'fg.muted', whiteSpace: 'nowrap' },
});

export const RoomTheatreControlsTimeNow = styled('b', {
  base: { color: 'fg.default', fontWeight: '600' },
});

// The scrubber and the volume: range inputs whose filled part is `--fill` (use-fill.ts).
export const RoomTheatreControlsRange = styled('input', {
  base: {
    '--fill': '0',
    appearance: 'none',
    height: '6px',
    borderRadius: '3px',
    bg: 'linear-gradient(90deg, {colors.fg.default} calc(var(--fill) * 100%), {colors.bg.raised} 0)',
    cursor: 'pointer',
    margin: '0',
    _disabled: { cursor: 'default', opacity: '0.5' },
    '&::-webkit-slider-thumb': { appearance: 'none', width: '14px', height: '14px', borderRadius: 'full', bg: 'fg.default', border: '0' },
    '&::-moz-range-thumb': { width: '14px', height: '14px', borderRadius: 'full', bg: 'fg.default', border: '0' },
  },
  variants: {
    kind: {
      scrub: { flex: '1', minWidth: '80px' },
      volume: { width: '72px', height: '4px', bg: 'linear-gradient(90deg, {colors.fg.muted} calc(var(--fill) * 100%), {colors.bg.raised} 0)', margin: '0 6px' },
    },
  },
});

export const RoomTheatreControlsMineRoot = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '14px', borderLeft: '1px solid', borderColor: 'border.rule' },
});

export const RoomTheatreControlsMineLabel = styled('span', {
  base: { fontSize: '12px', color: 'fg.subtle', marginRight: '6px', whiteSpace: 'nowrap' },
});

export const RoomTheatreControlsQualityButton = styled('button', {
  base: { border: '0', bg: 'bg.raised', borderRadius: '7px', padding: '4px 8px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', cursor: 'pointer' },
});

export const RoomTheatreControlsQualityContent = styled(Menu.Content, {
  base: { minWidth: '140px', bg: 'bg.panel', borderRadius: 'control', padding: '6px', boxShadow: 'floating', outline: '0', zIndex: '30' },
});

export const RoomTheatreControlsQualityItem = styled(Menu.Item, {
  base: { padding: '7px 10px', borderRadius: '7px', fontSize: '14px', cursor: 'pointer', _highlighted: { bg: 'bg.raised' } },
});
