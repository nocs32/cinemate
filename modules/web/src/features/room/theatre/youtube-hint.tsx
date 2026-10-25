import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTheatreYoutubeHintRoot } from './styled-components';

// Under a YouTube video, instead of our bar (D12): what YouTube's own buttons do here.
export const RoomTheatreYoutubeHint = observer(function RoomTheatreYoutubeHint(): ReactElement {
  const { locale, room } = useRootStore();

  return <RoomTheatreYoutubeHintRoot dimmed={room.lights.isDown}>{locale.t('controls.youtube')}</RoomTheatreYoutubeHintRoot>;
});
