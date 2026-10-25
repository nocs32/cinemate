import { styled } from 'styled-system/jsx';

// The lamp's button: the one bright thing on a screen (Invite, Join, Play it).
export const LampButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    transition: 'filter 0.15s ease',
    _hover: { filter: 'brightness(1.06)' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    size: {
      md: {},
      lg: { height: '48px', paddingInline: '22px', fontSize: '15px', fontWeight: '700' },
      sm: { height: '32px', paddingInline: '12px', fontSize: '13px' },
    },
  },
  defaultVariants: { size: 'md' },
});

// A quiet outlined button, for the second thing to do.
export const OutlineButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '1px solid',
    borderColor: 'fg.default',
    bg: 'transparent',
    borderRadius: 'control',
    height: '42px',
    paddingInline: '18px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    _hover: { bg: 'bg.hover' },
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    size: {
      md: {},
      sm: { height: '32px', paddingInline: '12px', fontSize: '13px', borderColor: 'border.seam' },
    },
  },
  defaultVariants: { size: 'md' },
});

// A small square icon button on the room's dark.
export const IconButton = styled('button', {
  base: {
    width: '34px',
    height: '34px',
    flex: 'none',
    display: 'grid',
    placeItems: 'center',
    border: '0',
    borderRadius: '8px',
    bg: 'transparent',
    color: 'fg.muted',
    cursor: 'pointer',
    _hover: { bg: 'bg.raised', color: 'fg.default' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed', _hover: { bg: 'transparent' } },
    '& svg': { width: '18px', height: '18px' },
  },
});

// The spinner while something loads.
export const Spinner = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'fg.muted',
    animation: 'spin 0.9s linear infinite',
    '& svg': { width: '22px', height: '22px' },
  },
});
