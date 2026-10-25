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
