import { styled } from 'styled-system/jsx';
import { viewerTones } from '../../../ui';

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

export const RoomTheatreSeatsItemSeat = styled('span', {
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

export const RoomTheatreSeatsItemInitial = styled('span', {
  base: { position: 'absolute', insetInline: '0', top: '9px', fontFamily: 'display', fontWeight: '700', fontSize: '13px', color: 'bg.room', pointerEvents: 'none' },
});

export const RoomTheatreSeatsItemName = styled('div', {
  base: { fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
});

export const RoomTheatreSeatsItemStatus = styled('div', {
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

export const RoomTheatreSeatsItemTally = styled('span', {
  base: { position: 'absolute', top: '-4px', right: '2px', zIndex: '1', fontSize: '11px', fontWeight: '700', bg: 'fg.default', color: 'bg.room', borderRadius: 'full', padding: '1px 6px' },
});
