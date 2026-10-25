import { useEffect, useRef, type RefObject } from 'react';

// A range input's filled part, as the `--fill` variable (0 to 1): it moves continuously, so it goes
// through the element, not React's props.
export const useRoomTheatreControlsFill = (fill: number): RefObject<HTMLInputElement | null> => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.style.setProperty('--fill', String(fill));
  }, [fill]);

  return ref;
};
