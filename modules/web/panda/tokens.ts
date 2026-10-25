import { defineTokens } from '@pandacss/dev';

// A small private cinema at night (spec §8, D20; `.scratch/look-notes.md`): a plum-violet auditorium
// around the screen, three tones of it for the room, its panels and its raised controls, the
// projector lamp's amber as the one accent, and a cool lilac white for text. Status colours are
// information: in step, waiting, late.
export const tokens = defineTokens({
  fonts: {
    body: { value: '"Onest Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
    // The wordmark, the waiting slate and the film leader's numbers: a wide display face that covers
    // Cyrillic.
    display: { value: '"Unbounded Variable", "Onest Variable", ui-sans-serif, system-ui, sans-serif' },
    emoji: { value: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' },
  },
  colors: {
    // Outside the room (behind a phone's rounded corners), the room, its panels, raised controls.
    night: {
      outside: { value: '#0E0B13' },
      auditorium: { value: '#18141F' },
      balcony: { value: '#231D2C' },
      aisle: { value: '#30283B' },
      aisleHigh: { value: '#3D3449' },
      rule: { value: '#2E2638' },
      seam: { value: '#4A4057' },
    },
    lamp: {
      base: { value: '#FFB23F' },
      ink: { value: '#2A1A00' },
    },
    houselight: {
      base: { value: '#ECE6F0' },
      dim: { value: '#A79DB3' },
      faint: { value: '#6F6580' },
    },
    status: {
      sync: { value: '#5BD49A' },
      late: { value: '#FF6F61' },
    },
    // Everyone's colour (protocol `viewerColors`): their seat, their name, their tickets.
    viewer: {
      teal: { value: '#3FC1B0' },
      sky: { value: '#5AB0FF' },
      coral: { value: '#FF7A6B' },
      violet: { value: '#A98BFF' },
      pink: { value: '#FF8CC6' },
      lime: { value: '#A6D36A' },
      orange: { value: '#F2A65A' },
      silver: { value: '#E8E0EE' },
    },
  },
  radii: {
    ticket: { value: '6px' },
    screen: { value: '8px' },
    control: { value: '10px' },
    card: { value: '14px' },
  },
});
