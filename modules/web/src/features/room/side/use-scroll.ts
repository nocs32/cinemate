import { useEffect, useRef, type RefObject } from 'react';

// Keeps a list scrolled to its newest line whenever one arrives.
export const useRoomSideScroll = (itemCount: number): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [itemCount]);

  return ref;
};
