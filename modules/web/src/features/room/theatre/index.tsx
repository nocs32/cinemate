import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTheatreControls } from './controls';
import { RoomTheatreLive } from './live';
import { RoomTheatreNow } from './now';
import { RoomTheatreScreen } from './screen';
import { RoomTheatreSeats } from './seats';
import { RoomTheatreRoot } from './styled-components';
import { RoomTheatreYoutubeHint } from './youtube-hint';

// The left of the room (the style board): the screen, the controls under it (ours for files, a line
// about YouTube's own bar for YouTube, D12), what's on, and the row of seats.
export const RoomTheatre = observer(function RoomTheatre(): ReactElement {
  const { room, ui } = useRootStore();
  const { screen, live } = room;

  return (
    <RoomTheatreRoot compact={ui.layout.isCompact}>
      <RoomTheatreScreen />
      {(live.isOn || live.sharer.problem) && <RoomTheatreLive />}
      {screen.showsFilm && !screen.isYoutube && <RoomTheatreControls />}
      {screen.showsFilm && screen.isYoutube && !ui.layout.isCompact && <RoomTheatreYoutubeHint />}
      {screen.showsFilm && !ui.layout.isCompact && <RoomTheatreNow />}
      <RoomTheatreSeats />
    </RoomTheatreRoot>
  );
});
