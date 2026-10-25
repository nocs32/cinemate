import { defineSemanticTokens } from '@pandacss/dev';

// Dark only. Names say what a colour is for; values come from tokens.ts.
export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      outside: { value: '{colors.night.outside}' },
      room: { value: '{colors.night.auditorium}' },
      panel: { value: '{colors.night.balcony}' },
      raised: { value: '{colors.night.aisle}' },
      raisedHigh: { value: '{colors.night.aisleHigh}' },
      hover: { value: 'rgba(236, 230, 240, 0.06)' },
      // Over the paused frame while the room waits or counts down.
      scrim: { value: 'rgba(16, 12, 22, 0.74)' },
      overlay: { value: 'rgba(14, 11, 19, 0.72)' },
    },
    fg: {
      default: { value: '{colors.houselight.base}' },
      muted: { value: '{colors.houselight.dim}' },
      subtle: { value: '{colors.houselight.faint}' },
    },
    border: {
      rule: { value: '{colors.night.rule}' },
      seam: { value: '{colors.night.seam}' },
    },
    accent: {
      default: { value: '{colors.lamp.base}' },
      ink: { value: '{colors.lamp.ink}' },
      ring: { value: '{colors.lamp.base}' },
    },
    sync: { value: '{colors.status.sync}' },
    late: { value: '{colors.status.late}' },
  },
  shadows: {
    room: { value: '0 30px 80px -30px #000' },
    floating: { value: '0 0 0 1px rgba(236, 230, 240, 0.08), 0 14px 36px rgba(0, 0, 0, 0.55)' },
  },
});
