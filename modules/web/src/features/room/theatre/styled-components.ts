import { Menu } from '@ark-ui/react/menu';
import { styled } from 'styled-system/jsx';

const dimmed = { true: { opacity: '0.28' } } as const;

export const RoomTheatreRoot = styled('section', {
  base: { padding: '22px 24px 18px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)', gridAutoRows: 'auto', gap: '12px', minHeight: '0', minWidth: '0' },
  variants: {
    compact: { true: { padding: '8px 10px', gap: '6px' } },
  },
});

export const RoomTheatreNowRoot = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: '0', transition: 'opacity 0.6s ease', '& > button': { marginLeft: 'auto', flex: 'none' } },
  variants: { dimmed },
});

export const RoomTheatreNowTitle = styled('h3', {
  base: { margin: '0', fontSize: '17px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: '0' },
});

export const RoomTheatreNowMeta = styled('span', {
  base: { color: 'fg.subtle', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: '1', minWidth: '0' },
});

export const RoomTheatreYoutubeHintRoot = styled('p', {
  base: { margin: '0', fontSize: '13px', color: 'fg.subtle', maxWidth: '80ch', transition: 'opacity 0.6s ease' },
  variants: { dimmed },
});

// Under the screen while someone shares (spec §14.1).
export const RoomTheatreLiveRoot = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '14px', minWidth: '0', minHeight: '44px', transition: 'opacity 0.6s ease' },
  variants: { dimmed },
});

export const RoomTheatreLiveNote = styled('p', {
  base: {
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: 'fg.muted',
    minWidth: '0',
    '&::before': { content: '""', width: '8px', height: '8px', flex: 'none', borderRadius: 'full', bg: 'late', animation: 'pulse 1.6s ease-in-out infinite' },
  },
});

export const RoomTheatreLiveProblem = styled('p', {
  base: { margin: '0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'late', minWidth: '0' },
});

export const RoomTheatreLiveTools = styled('div', {
  base: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', flex: 'none' },
});

export const RoomTheatreLiveQualityButton = styled('button', {
  base: { border: '0', bg: 'bg.raised', borderRadius: '7px', padding: '6px 10px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' },
});

export const RoomTheatreLiveQualityContent = styled(Menu.Content, {
  base: { minWidth: '160px', bg: 'bg.panel', borderRadius: 'control', padding: '6px', boxShadow: 'floating', outline: '0', zIndex: '30' },
});

export const RoomTheatreLiveQualityItem = styled(Menu.Item, {
  base: { padding: '7px 10px', borderRadius: '7px', fontSize: '14px', cursor: 'pointer', _highlighted: { bg: 'bg.raised' } },
  variants: {
    chosen: { true: { color: 'accent.default', fontWeight: '600' } },
  },
});
