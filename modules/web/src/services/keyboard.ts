import type { RoomScreenControlsStore } from '../stores/room/screen/controls';

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.closest('[role="menu"]') !== null);

// The room's keys (spec §9): Space plays and pauses for everyone, ← → jump 10 s for everyone, F is
// fullscreen and M mutes, just for you. Never while typing. Started once in index.tsx; returns a
// function that stops it.
export const watchKeys = (controls: RoomScreenControlsStore): (() => void) => {
  const actions: Readonly<Record<string, () => void>> = {
    ' ': controls.togglePlay,
    ArrowLeft: controls.back,
    ArrowRight: controls.forward,
    f: controls.toggleFullscreen,
    m: controls.toggleMute,
  };

  const press = (event: KeyboardEvent): void => {
    const action = actions[event.key.length === 1 ? event.key.toLowerCase() : event.key];

    if (!action || event.altKey || event.ctrlKey || event.metaKey || isTyping(event.target)) return;

    if (event.target instanceof HTMLButtonElement && event.key === ' ') return;

    event.preventDefault();
    action();
  };

  window.addEventListener('keydown', press);

  return () => window.removeEventListener('keydown', press);
};
