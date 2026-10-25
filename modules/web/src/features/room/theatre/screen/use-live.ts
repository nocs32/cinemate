import { useEffect, useRef, type RefObject } from 'react';
import type { RoomLiveStore } from '../../../../stores/room/live';

// Hands the live layer's element to the live store, which puts the live screen's video in it, and takes
// it back when the screen leaves the page.
export const useRoomTheatreScreenLive = (live: RoomLiveStore): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) live.mount(ref.current);

    return () => live.detach();
  }, [live]);

  return ref;
};
