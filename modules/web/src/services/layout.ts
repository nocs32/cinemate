import type { UiLayoutStore } from '../stores/ui/layout';

// Small screens: narrower than a tablet, or no taller than a phone held sideways.
const compactQuery = '(max-width: 899px), (max-height: 540px)';

// Tells the layout store whether the screen is compact, now and whenever that changes. Started
// once in index.tsx; returns a function that stops it.
export const watchLayout = (layout: UiLayoutStore): (() => void) => {
  const query = window.matchMedia(compactQuery);
  const update = (): void => layout.setCompact(query.matches);

  update();
  query.addEventListener('change', update);

  return () => query.removeEventListener('change', update);
};
