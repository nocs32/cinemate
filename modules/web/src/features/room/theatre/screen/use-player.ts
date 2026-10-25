import { useEffect, useRef, type RefObject } from 'react';
import type { RoomScreenDriverStore } from '../../../../stores/room/screen/driver';

// Hands the screen's element to the sync driver, which puts the player in it, and takes it back when
// the screen leaves the page.
export const useRoomTheatreScreenPlayer = (driver: RoomScreenDriverStore): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) driver.mount(ref.current);

    return () => driver.detach();
  }, [driver]);

  return ref;
};
