import { styled } from 'styled-system/jsx';
import { viewerTones } from '../../../../ui';

export const RoomTheatreScreenWrap = styled('div', {
  base: { position: 'relative', minHeight: '0', minWidth: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', containerType: 'size' },
});

// The light from the frame on the wall around the screen; brighter with the house lights down.
export const RoomTheatreScreenSpill = styled('img', {
  base: {
    position: 'absolute',
    inset: '-10% -6%',
    width: '112%',
    height: '120%',
    objectFit: 'cover',
    filter: 'blur(70px) saturate(1.4)',
    opacity: '0.28',
    transition: 'opacity 1.2s ease',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  variants: {
    bright: { true: { opacity: '0.5' } },
  },
});

export const RoomTheatreScreenFrame = styled('div', {
  base: {
    position: 'relative',
    // The largest 16:9 that fits the space the theatre gives it.
    width: 'min(100cqw, 100cqh * 16 / 9)',
    aspectRatio: '16 / 9',
    bg: 'black',
    borderRadius: 'screen',
    overflow: 'hidden',
    containerType: 'size',
    '&:fullscreen': { width: '100vw', height: '100vh', aspectRatio: 'auto', borderRadius: '0' },
  },
  variants: {
    bare: { true: { bg: 'bg.room', outline: '1px dashed', outlineColor: 'border.seam', outlineOffset: '-1px' } },
  },
});

// The player's own element: YouTube's iframe or the video element goes in here.
export const RoomTheatreScreenPlayer = styled('div', {
  base: { position: 'absolute', inset: '0', '& iframe, & video, & > div': { width: '100%', height: '100%', display: 'block', border: '0', bg: 'black' } },
});

export const RoomTheatreScreenScrim = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '2', display: 'flex', alignItems: 'center', justifyContent: 'center', bg: 'bg.scrim', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.25s ease', padding: '16px' },
});

export const RoomTheatreScreenEmptyRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(16px, 6cqw, 48px)', maxWidth: '640px' },
});

export const RoomTheatreScreenEmptyTitle = styled('h2', {
  base: { margin: '0 0 12px', fontFamily: 'display', fontSize: 'clamp(20px, 5cqw, 34px)', lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em', textWrap: 'balance' },
});

export const RoomTheatreScreenEmptyText = styled('p', {
  base: { margin: '0 0 22px', color: 'fg.muted', maxWidth: '60ch', '@container (max-height: 260px)': { display: 'none' } },
});

// The waiting slate.
export const RoomTheatreScreenSlateRoot = styled('div', {
  base: { textAlign: 'center', maxWidth: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
});

export const RoomTheatreScreenSlateWho = styled('span', {
  base: {
    position: 'relative',
    width: '76px',
    height: '70px',
    marginBottom: '18px',
    color: 'var(--tone)',
    '& svg': { width: '100%', height: '100%' },
    '&::after': { content: '""', position: 'absolute', inset: '-18px -20px -14px', borderRadius: 'full', border: '2px solid', borderColor: 'late', opacity: '0', animation: 'ring 1.6s ease-out infinite' },
    '@container (max-height: 300px)': { display: 'none' },
  },
  variants: { tone: viewerTones },
});

export const RoomTheatreScreenSlateTitle = styled('h2', {
  base: { margin: '0 0 10px', fontFamily: 'display', fontSize: 'clamp(22px, 6cqw, 40px)', lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em', textWrap: 'balance' },
});

export const RoomTheatreScreenSlateLine = styled('p', {
  base: { margin: '0', color: 'fg.muted', fontSize: '16px' },
});

export const RoomTheatreScreenSlateReason = styled('span', {
  base: { color: 'fg.default' },
});

export const RoomTheatreScreenSlateTally = styled('p', {
  base: { margin: '6px 0 0', fontSize: '14px', color: 'fg.subtle' },
});

export const RoomTheatreScreenSlateGoOn = styled('div', {
  base: { marginTop: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.3s ease' },
});

export const RoomTheatreScreenSlateHint = styled('p', {
  base: { margin: '0', fontSize: '13px', color: 'fg.subtle' },
});

// The film leader.
export const RoomTheatreScreenLeaderRoot = styled('div', {
  base: { textAlign: 'center' },
});

export const RoomTheatreScreenLeaderRing = styled('div', {
  base: {
    position: 'relative',
    width: 'min(220px, 46cqh)',
    aspectRatio: '1',
    margin: '0 auto 18px',
    borderRadius: 'full',
    border: '2px solid rgba(236, 230, 240, 0.7)',
    bg: 'radial-gradient(circle, transparent 64%, rgba(236, 230, 240, 0.5) 64.5%, transparent 66%), rgba(255, 178, 63, 0.06)',
    '&::before': { content: '""', position: 'absolute', left: '50%', top: '-30px', bottom: '-30px', width: '1px', bg: 'rgba(236, 230, 240, 0.35)' },
    '&::after': { content: '""', position: 'absolute', top: '50%', left: '-40px', right: '-40px', height: '1px', bg: 'rgba(236, 230, 240, 0.35)' },
  },
});

// The leader's hand, sweeping round once a second.
export const RoomTheatreScreenLeaderHand = styled('span', {
  base: {
    position: 'absolute',
    inset: '0',
    borderRadius: 'full',
    bg: 'conic-gradient(from 0deg, rgba(255, 178, 63, 0.38), rgba(255, 178, 63, 0) 30%)',
    animation: 'sweep 1s linear infinite',
  },
});

export const RoomTheatreScreenLeaderNumber = styled('span', {
  base: { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', fontFamily: 'display', fontSize: 'min(104px, 22cqh)', fontWeight: '700', lineHeight: '1', animation: 'tick 1s ease-out' },
});

export const RoomTheatreScreenLeaderLabel = styled('p', {
  base: { margin: '0', color: 'fg.muted', fontSize: '16px' },
});

// Up next.
export const RoomTheatreScreenUpNextRoot = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '24px', maxWidth: '640px', '@container (max-width: 520px)': { flexDirection: 'column', alignItems: 'flex-start', gap: '12px' } },
});

export const RoomTheatreScreenUpNextPoster = styled('div', {
  base: {
    flex: 'none',
    width: 'min(240px, 34cqw)',
    aspectRatio: '16 / 9',
    borderRadius: 'ticket',
    overflow: 'hidden',
    bg: 'bg.raised',
    display: 'grid',
    placeItems: 'center',
    color: 'fg.subtle',
    '& img': { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    '& svg': { width: '32px', height: '32px' },
    '@container (max-height: 300px)': { display: 'none' },
  },
});

export const RoomTheatreScreenUpNextEyebrow = styled('p', {
  base: { margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: 'accent.default' },
});

export const RoomTheatreScreenUpNextTitle = styled('h2', {
  base: { margin: '0 0 6px', fontFamily: 'display', fontSize: 'clamp(18px, 4cqw, 26px)', lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' },
});

export const RoomTheatreScreenUpNextLabel = styled('p', {
  base: { margin: '0 0 16px', color: 'fg.muted' },
});

export const RoomTheatreScreenUpNextActions = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
});

export const RoomTheatreScreenUnblockRoot = styled('div', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' },
});

export const RoomTheatreScreenUnblockText = styled('p', {
  base: { margin: '0', color: 'fg.muted', maxWidth: '40ch' },
});

export const RoomTheatreScreenChip = styled('p', {
  base: { position: 'absolute', top: '12px', left: '12px', zIndex: '2', margin: '0', padding: '6px 12px', borderRadius: 'full', bg: 'bg.scrim', fontSize: '13px', color: 'fg.default', pointerEvents: 'none' },
});

// Reactions in flight: each person's in their own lane across the screen.
export const RoomTheatreScreenFlightsRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '3', pointerEvents: 'none', overflow: 'hidden' },
});

export const RoomTheatreScreenFlightsRise = styled('div', {
  base: { position: 'absolute', bottom: '10%', fontSize: '30px', fontFamily: 'emoji', animation: 'rise 3s ease-out forwards' },
  variants: {
    lane: {
      l1: { left: '14%' },
      l2: { left: '23%' },
      l3: { left: '32%' },
      l4: { left: '41%' },
      l5: { left: '50%' },
      l6: { left: '59%' },
      l7: { left: '68%' },
      l8: { left: '77%' },
      l9: { left: '86%' },
    },
  },
});

export const RoomTheatreScreenFlightsSway = styled('div', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'swayGentle 0.9s ease-in-out infinite alternate' },
  variants: {
    sway: {
      gentle: { animationName: 'swayGentle' },
      wide: { animationName: 'swayWide' },
      wobbly: { animationName: 'swayWobbly' },
    },
  },
});

export const RoomTheatreScreenFlightsName = styled('span', {
  base: { marginTop: '2px', fontFamily: 'body', fontSize: '11px', fontWeight: '600', padding: '1px 6px', borderRadius: 'full', bg: 'bg.scrim', whiteSpace: 'nowrap' },
});
