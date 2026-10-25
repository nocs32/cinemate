import { defineKeyframes } from '@pandacss/dev';

export const keyframes = defineKeyframes({
  // The ring round the slow one's seat on the waiting slate.
  ring: {
    '0%': { transform: 'scale(0.7)', opacity: '0.9' },
    '100%': { transform: 'scale(1.25)', opacity: '0' },
  },
  // The film leader's hand, once round a second.
  sweep: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  // A reaction floating up over the screen.
  rise: {
    '0%': { transform: 'translate(-50%, 0) scale(0.6)', opacity: '0' },
    '10%': { transform: 'translate(-50%, -20px) scale(1)', opacity: '1' },
    '75%': { opacity: '1' },
    '100%': { transform: 'translate(-50%, -240px) scale(1.15)', opacity: '0' },
  },
  swayGentle: {
    from: { transform: 'translateX(-8px) rotate(-5deg)' },
    to: { transform: 'translateX(8px) rotate(5deg)' },
  },
  swayWide: {
    from: { transform: 'translateX(-18px) rotate(-8deg)' },
    to: { transform: 'translateX(18px) rotate(8deg)' },
  },
  swayWobbly: {
    from: { transform: 'translateX(-10px) rotate(-12deg)' },
    to: { transform: 'translateX(10px) rotate(12deg)' },
  },
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  dialogIn: {
    from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
    to: { opacity: '1', transform: 'translateY(0) scale(1)' },
  },
  // A number on the leader landing.
  tick: {
    '0%': { transform: 'scale(1.2)', opacity: '0.4' },
    '30%': { transform: 'scale(1)', opacity: '1' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  spin: {
    to: { transform: 'rotate(360deg)' },
  },
  // The live tag's red dot.
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.35' },
  },
});
