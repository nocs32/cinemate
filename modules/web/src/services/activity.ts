import type { RoomClockStore } from '../stores/room/clock';
import type { RoomLightsStore } from '../stores/room/lights';

const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

// Any movement brings the house lights back up; a tab that comes back checks the room clock again
// (browsers slow hidden tabs down, spec §5.6). Started once in index.tsx; returns a function that
// stops it.
export const watchActivity = (lights: RoomLightsStore, clock: RoomClockStore): (() => void) => {
  const wake = (): void => lights.wake();

  const visible = (): void => {
    if (document.visibilityState === 'visible') clock.burst();
  };

  events.forEach((type) => window.addEventListener(type, wake, { passive: true }));
  document.addEventListener('visibilitychange', visible);

  return () => {
    events.forEach((type) => window.removeEventListener(type, wake));
    document.removeEventListener('visibilitychange', visible);
  };
};
