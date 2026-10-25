import { Menu } from '@ark-ui/react/menu';
import { styled } from 'styled-system/jsx';

export const RoomTopBarRoot = styled('header', {
  base: {
    display: 'grid',
    gridTemplateColumns: '220px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '20px',
    paddingInline: '20px',
    borderBottom: '1px solid',
    borderColor: 'border.rule',
    transition: 'opacity 0.6s ease',
    position: 'relative',
    zIndex: '4',
  },
  variants: {
    dimmed: { true: { opacity: '0.28' } },
    compact: { true: { gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '10px', paddingInline: '10px' } },
  },
});

export const RoomTopBarBrand = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'display', fontWeight: '700', fontSize: '19px', letterSpacing: '-0.01em', '& svg': { width: '28px', height: '28px', flex: 'none' } },
});

export const RoomTopBarRight = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '12px' },
});

export const RoomTopBarCount = styled('span', {
  base: { color: 'fg.muted', fontSize: '14px', whiteSpace: 'nowrap' },
});

export const RoomTopBarPill = styled('button', {
  base: { height: '30px', paddingInline: '11px', border: '1px solid', borderColor: 'border.seam', borderRadius: 'full', bg: 'transparent', color: 'fg.muted', fontSize: '12px', fontWeight: '600', cursor: 'pointer', _hover: { color: 'fg.default' } },
  variants: {
    accent: { true: { borderColor: 'accent.default', color: 'accent.default' } },
  },
});

export const RoomTopBarInviteButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    border: '0',
    bg: 'accent.default',
    color: 'accent.ink',
    fontWeight: '600',
    borderRadius: 'control',
    height: '40px',
    paddingInline: '16px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    compact: { true: { height: '34px', paddingInline: '10px', fontSize: '13px' } },
  },
});

export const RoomTopBarMenuContent = styled(Menu.Content, {
  base: { minWidth: '220px', bg: 'bg.panel', borderRadius: 'control', padding: '6px', boxShadow: 'floating', outline: '0', zIndex: '30' },
});

export const RoomTopBarMenuTitle = styled('p', {
  base: { margin: '0', padding: '6px 10px 8px', fontSize: '12px', color: 'fg.subtle', maxWidth: '240px' },
});

export const RoomTopBarMenuItem = styled(Menu.Item, {
  base: { padding: '8px 10px', borderRadius: '7px', fontSize: '14px', cursor: 'pointer', _highlighted: { bg: 'bg.raised' } },
});
