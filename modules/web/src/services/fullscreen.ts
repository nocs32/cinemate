import type { FullscreenService } from './types';

// Fullscreen for the screen and what's drawn over it (the waiting slate, the leader, reactions).
export const createFullscreen = (): FullscreenService => {
  let target: HTMLElement | null = null;

  return {
    setTarget: (element) => {
      target = element;
    },
    toggle: () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void target?.requestFullscreen().catch(() => undefined);
    },
    isOn: () => document.fullscreenElement !== null,
    listen: (changed) => {
      document.addEventListener('fullscreenchange', changed);

      return () => document.removeEventListener('fullscreenchange', changed);
    },
  };
};
