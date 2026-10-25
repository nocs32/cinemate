interface PreventableEvent {
  preventDefault: () => void;
}

type EventHandler = (event: PreventableEvent) => void;

// For form submits handled by a store action: `onSubmit={withoutDefault(feed.send)}`.
export const withoutDefault =
  (action: () => void): EventHandler =>
  (event) => {
    event.preventDefault();
    action();
  };

// A video position or length as a clock: 4:05, or 1:02:09 past an hour.
export const formatClock = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = String(total % 60).padStart(2, '0');

  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}` : `${minutes}:${secs}`;
};
