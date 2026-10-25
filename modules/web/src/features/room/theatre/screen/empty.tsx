import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { PasteBox } from '../../paste-box';
import { RoomTheatreScreenEmptyRoot, RoomTheatreScreenEmptyText, RoomTheatreScreenEmptyTitle } from './styled-components';

// Nothing on screen, or the queue ran out: an invitation to paste a link.
export const RoomTheatreScreenEmpty = observer(function RoomTheatreScreenEmpty(): ReactElement {
  const { locale, room } = useRootStore();
  const isEnded = room.screen.overlay === 'ended';

  return (
    <RoomTheatreScreenEmptyRoot>
      <RoomTheatreScreenEmptyTitle>{locale.t(isEnded ? 'screen.ended.title' : 'screen.empty.title')}</RoomTheatreScreenEmptyTitle>
      <RoomTheatreScreenEmptyText>{locale.t(isEnded ? 'screen.ended.text' : 'screen.empty.text')}</RoomTheatreScreenEmptyText>
      <PasteBox paste={room.screenPaste} size="stage" placeholder={locale.t('screen.empty.placeholder')} buttonLabel={locale.t('screen.empty.play')} />
    </RoomTheatreScreenEmptyRoot>
  );
});
