import { styled } from 'styled-system/jsx';
import { viewerTones } from '../../ui';

export const RoomRoot = styled('div', {
  base: { height: '100dvh', display: 'grid', gridTemplateRows: '60px minmax(0, 1fr)', bg: 'bg.room', position: 'relative', overflow: 'hidden' },
  variants: {
    compact: { true: { gridTemplateRows: '48px minmax(0, 1fr)' } },
  },
});

export const RoomMain = styled('main', {
  base: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', minHeight: '0' },
  variants: {
    compact: { true: { gridTemplateColumns: 'minmax(0, 1fr) 260px' } },
  },
});

// The start page.
export const RoomLandingRoot = styled('main', {
  base: {
    minHeight: '100dvh',
    maxWidth: '680px',
    marginInline: 'auto',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '20px',
    overflowY: 'auto',
  },
});

export const RoomLandingBrand = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'display', fontWeight: '700', fontSize: '19px', '& svg': { width: '30px', height: '30px' } },
});

export const RoomLandingLanguage = styled('button', {
  base: { marginLeft: '12px', border: '1px solid', borderColor: 'border.seam', bg: 'transparent', borderRadius: 'full', paddingInline: '11px', height: '28px', fontFamily: 'body', fontSize: '12px', fontWeight: '600', color: 'fg.muted', cursor: 'pointer' },
});

export const RoomLandingTitle = styled('h1', {
  base: { margin: '12px 0 0', fontFamily: 'display', fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: '1.08', fontWeight: '700', letterSpacing: '-0.02em', textWrap: 'balance' },
});

export const RoomLandingText = styled('p', {
  base: { margin: '0', color: 'fg.muted', fontSize: '17px', maxWidth: '58ch' },
});

export const RoomLandingPoints = styled('ul', {
  base: { listStyle: 'none', margin: '4px 0 8px', padding: '0', display: 'grid', gap: '8px' },
});

export const RoomLandingPoint = styled('li', {
  base: {
    display: 'flex',
    gap: '10px',
    alignItems: 'baseline',
    '&::before': { content: '""', flex: 'none', width: '8px', height: '8px', borderRadius: 'full', bg: 'accent.default', transform: 'translateY(-1px)' },
  },
});

export const RoomLandingNote = styled('p', {
  base: { margin: '0', fontSize: '13px', color: 'fg.subtle' },
});

// Opening, joining, or no room.
export const RoomStatusRoot = styled('main', {
  base: { minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '24px' },
});

export const RoomStatusCard = styled('section', {
  base: { width: 'min(420px, 100%)', bg: 'bg.panel', borderRadius: 'card', padding: '28px', display: 'grid', justifyItems: 'start', gap: '14px', boxShadow: 'floating' },
});

export const RoomStatusLogo = styled('span', {
  base: { display: 'inline-flex', '& svg': { width: '36px', height: '36px' } },
});

export const RoomStatusTitle = styled('h1', {
  base: { margin: '0', fontFamily: 'display', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.01em' },
});

export const RoomStatusText = styled('p', {
  base: { margin: '0', color: 'fg.muted' },
});

// The join card.
export const RoomJoinRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '20', bg: 'bg.overlay', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: '16px', overflowY: 'auto', animation: 'fadeIn 0.2s ease' },
});

export const RoomJoinCard = styled('form', {
  base: { width: 'min(420px, 100%)', bg: 'bg.panel', borderRadius: 'card', padding: '28px', display: 'grid', gap: '16px', boxShadow: 'floating', animation: 'dialogIn 0.25s ease', '& > button': { width: '100%' } },
});

export const RoomJoinTitle = styled('h2', {
  base: { margin: '0', fontFamily: 'display', fontSize: '26px', lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' },
});

export const RoomJoinText = styled('p', {
  base: { margin: '-6px 0 0', color: 'fg.muted' },
});

export const RoomJoinField = styled('div', {
  base: { display: 'grid', gap: '6px' },
});

export const RoomJoinLabel = styled('label', {
  base: { fontSize: '13px', color: 'fg.muted' },
});

export const RoomJoinInput = styled('input', {
  base: { width: '100%', height: '44px', bg: 'bg.raised', border: '1px solid transparent', borderRadius: 'control', paddingInline: '14px', outline: '0', _focus: { borderColor: 'accent.default' } },
});

// The colour picker: the join card's and your seat's popup's.
export const ColorPickerList = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
});

export const ColorPickerSwatchButton = styled('button', {
  base: {
    width: '30px',
    height: '30px',
    borderRadius: 'full',
    border: '0',
    bg: 'var(--tone)',
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'display',
    fontSize: '12px',
    fontWeight: '700',
    color: 'bg.room',
    cursor: 'pointer',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'scale(1.08)' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed', _hover: { transform: 'none' } },
  },
  variants: {
    tone: viewerTones,
    picked: { true: { boxShadow: '0 0 0 2px {colors.bg.panel}, 0 0 0 4px {colors.fg.default}' } },
  },
});

export const ColorPickerHint = styled('p', {
  base: { margin: '0', fontSize: '12px', color: 'fg.subtle' },
});

export const RoomJoinHint = styled('p', {
  base: { margin: '-6px 0 0', fontSize: '13px', color: 'fg.subtle' },
});

// A box to paste a link into: the top bar's, and the empty screen's.
export const PasteBoxWrap = styled('div', {
  base: { position: 'relative', width: '100%', minWidth: '0' },
  variants: {
    size: {
      bar: { maxWidth: '620px', justifySelf: 'center' },
      side: {},
      stage: { maxWidth: '640px' },
    },
  },
});

export const PasteBoxRoot = styled('form', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    bg: 'bg.raised',
    borderRadius: 'control',
    border: '1px solid transparent',
    _focusWithin: { borderColor: 'accent.default' },
    '& > svg': { width: '16px', height: '16px', color: 'fg.muted', flex: 'none' },
  },
  variants: {
    size: {
      bar: { height: '40px', padding: '0 6px 0 14px' },
      side: { height: '38px', padding: '0 5px 0 12px' },
      stage: {
        height: 'clamp(48px, 9cqh, 64px)',
        padding: '0 8px 0 20px',
        bg: 'rgba(16, 12, 22, 0.7)',
        backdropFilter: 'blur(6px)',
        border: '1px solid',
        borderColor: 'border.seam',
        boxShadow: '0 18px 50px -18px rgba(0, 0, 0, 0.8)',
        '& input': { fontSize: 'clamp(14px, 1.7cqw, 17px)' },
      },
    },
    refused: { true: { borderColor: 'late', _focusWithin: { borderColor: 'late' } } },
  },
});

export const PasteBoxInput = styled('input', {
  base: { flex: '1', minWidth: '0', bg: 'transparent', border: '0', outline: '0', fontSize: '14px', _placeholder: { color: 'fg.subtle' } },
});

export const PasteBoxButton = styled('button', {
  base: { flex: 'none', border: '0', borderRadius: '7px', fontWeight: '600', cursor: 'pointer', _disabled: { cursor: 'default', opacity: '0.6' } },
  variants: {
    size: {
      bar: { bg: 'bg.raisedHigh', padding: '5px 12px', fontSize: '13px' },
      side: { bg: 'bg.raisedHigh', padding: '5px 12px', fontSize: '13px' },
      stage: { bg: 'accent.default', color: 'accent.ink', height: 'calc(100% - 14px)', paddingInline: 'clamp(16px, 2.6cqw, 26px)', fontSize: 'clamp(14px, 1.6cqw, 16px)', borderRadius: '8px' },
    },
  },
});

export const PasteBoxNote = styled('p', {
  base: { margin: '0', fontSize: '12px', color: 'sync' },
  variants: {
    size: {
      bar: { position: 'absolute', top: 'calc(100% + 6px)', left: '14px', zIndex: '5', bg: 'bg.panel', padding: '4px 10px', borderRadius: '6px', boxShadow: 'floating' },
      side: { position: 'absolute', bottom: 'calc(100% + 6px)', left: '0', zIndex: '5', bg: 'bg.panel', padding: '4px 10px', borderRadius: '6px', boxShadow: 'floating' },
      stage: { marginTop: '10px', textAlign: 'center' },
    },
    refused: { true: { color: 'late' } },
  },
});
