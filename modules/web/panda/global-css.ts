import { defineGlobalStyles } from '@pandacss/dev';

export const globalCss = defineGlobalStyles({
  html: {
    colorScheme: 'dark',
  },
  'html, body, #root': {
    height: '100%',
  },
  body: {
    fontFamily: 'body',
    fontSize: '15px',
    lineHeight: '1.45',
    color: 'fg.default',
    bg: 'bg.room',
    overflow: 'hidden',
    WebkitFontSmoothing: 'antialiased',
  },
  'button, input, textarea, select': {
    font: 'inherit',
    color: 'inherit',
  },
  ':focus-visible': {
    outline: '2px solid',
    outlineColor: 'accent.ring',
    outlineOffset: '2px',
  },
  '::selection': {
    bg: 'rgba(255, 178, 63, 0.35)',
  },
  '@media (prefers-reduced-motion: reduce)': {
    '*, *::before, *::after': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important',
    },
  },
});
