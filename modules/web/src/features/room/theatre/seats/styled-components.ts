import { Popover } from '@ark-ui/react/popover';
import { styled } from 'styled-system/jsx';
import { viewerTones } from '../../../../ui';

const dimmed = { true: { opacity: '0.28' } } as const;

export const RoomTheatreSeatsRoot = styled('ol', {
  base: { listStyle: 'none', margin: '4px 0 0', padding: '4px 0 0', display: 'flex', gap: '18px', overflowX: 'auto', transition: 'opacity 0.6s ease' },
  variants: {
    dimmed,
    compact: { true: { gap: '6px', margin: '0', padding: '2px 0 0' } },
  },
});

export const RoomTheatreSeatsItemRoot = styled('li', {
  base: { width: '72px', flex: 'none', textAlign: 'center', position: 'relative' },
  variants: {
    compact: { true: { width: '46px' } },
  },
});

export const RoomTheatreSeatsSeatShape = styled('span', {
  base: {
    position: 'relative',
    display: 'block',
    width: '48px',
    height: '44px',
    margin: '0 auto 6px',
    color: 'var(--tone)',
    transition: 'opacity 0.3s ease',
    '& svg': { width: '100%', height: '100%', display: 'block' },
  },
  variants: {
    tone: viewerTones,
    away: { true: { opacity: '0.45' } },
  },
});

export const RoomTheatreSeatsSeatInitial = styled('span', {
  base: { position: 'absolute', insetInline: '0', top: '9px', fontFamily: 'display', fontWeight: '700', fontSize: '13px', color: 'bg.room', pointerEvents: 'none' },
});

export const RoomTheatreSeatsSeatName = styled('div', {
  base: { fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
});

export const RoomTheatreSeatsSeatStatus = styled('div', {
  base: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    '&::before': { content: '""', width: '6px', height: '6px', borderRadius: 'full', bg: 'currentColor', flex: 'none' },
  },
  variants: {
    tone: {
      sync: { color: 'sync' },
      late: { color: 'late' },
      quiet: { color: 'fg.muted' },
    },
  },
});

export const RoomTheatreSeatsSeatTally = styled('span', {
  base: { position: 'absolute', top: '-4px', right: '2px', zIndex: '1', fontSize: '11px', fontWeight: '700', bg: 'fg.default', color: 'bg.room', borderRadius: 'full', padding: '1px 6px' },
});

// Your own seat: a button that opens the popup to change your name and colour.
export const RoomTheatreSeatsMineButton = styled('button', {
  base: {
    position: 'relative',
    display: 'block',
    width: '100%',
    padding: '0',
    border: '0',
    bg: 'transparent',
    color: 'inherit',
    textAlign: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    '& > span:nth-of-type(2)': { transition: 'transform 0.15s ease' },
    '&:hover > span:nth-of-type(2)': { transform: 'translateY(-2px)' },
  },
});

export const RoomTheatreSeatsMinePanelRoot = styled(Popover.Content, {
  base: { width: 'min(344px, calc(100vw - 32px))', bg: 'bg.panel', borderRadius: 'card', padding: '20px', boxShadow: 'floating', outline: '0', zIndex: '30', animation: 'dialogIn 0.2s ease' },
});

export const RoomTheatreSeatsMinePanelForm = styled('form', {
  base: { display: 'grid', gap: '14px', '& > button': { width: '100%' } },
});

export const RoomTheatreSeatsMinePanelTitle = styled('h2', {
  base: { margin: '0', fontFamily: 'display', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.01em' },
});

export const RoomTheatreSeatsMinePanelField = styled('div', {
  base: { display: 'grid', gap: '6px' },
});

export const RoomTheatreSeatsMinePanelLabel = styled('label', {
  base: { fontSize: '13px', color: 'fg.muted' },
});

export const RoomTheatreSeatsMinePanelInput = styled('input', {
  base: { width: '100%', height: '40px', bg: 'bg.raised', border: '1px solid transparent', borderRadius: 'control', paddingInline: '12px', outline: '0', _focus: { borderColor: 'accent.default' } },
});

export const RoomTheatreSeatsMinePanelHint = styled('p', {
  base: { margin: '-4px 0 0', fontSize: '12px', color: 'fg.subtle' },
});
