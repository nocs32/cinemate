import { useEffect, useRef, type RefObject } from 'react';
import type { RoomScreenControlsStore } from '../../../../stores/room/screen/controls';

// The screen with everything drawn over it is what goes fullscreen.
export const useRoomTheatreScreenFrame = (controls: RoomScreenControlsStore): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    controls.setFullscreenTarget(ref.current);

    return () => controls.setFullscreenTarget(null);
  }, [controls]);

  return ref;
};
