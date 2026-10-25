import type { RoomClockStore } from '../stores/room/clock';
import type { RoomLightsStore } from '../stores/room/lights';

// Whoever lets the sound on: the room, for its videos and its live share.
interface SoundGate {
  allowSound: () => void;
}

const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

// Any movement brings the house lights back up; the first click or key lets the sound on; a tab that
// comes back checks the room clock again (browsers slow hidden tabs down, spec §5.6). Started once in
// index.tsx; returns a function that stops it.
export const watchActivity = (lights: RoomLightsStore, clock: RoomClockStore, driver: SoundGate): (() => void) => {
  const wake = (event: Event): void => {
    lights.wake();

    if (event.type === 'pointerdown' || event.type === 'keydown') driver.allowSound();
  };

  // A click inside YouTube's player never reaches this page, but it moves the focus into the player,
  // and the browser counts that click for the whole page.
  const intoPlayer = (): void => {
    window.setTimeout(() => {
      if (document.activeElement instanceof HTMLIFrameElement) driver.allowSound();
    }, 0);
  };

  const visible = (): void => {
    if (document.visibilityState === 'visible') clock.burst();
  };

  events.forEach((type) => window.addEventListener(type, wake, { passive: true }));
  window.addEventListener('blur', intoPlayer);
  document.addEventListener('visibilitychange', visible);

  return () => {
    window.removeEventListener('blur', intoPlayer);
    events.forEach((type) => window.removeEventListener(type, wake));
    document.removeEventListener('visibilitychange', visible);
  };
};
