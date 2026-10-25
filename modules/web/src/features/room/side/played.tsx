import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSideEmpty, RoomSideList, RoomSideNote, RoomSideScroll } from './styled-components';
import { RoomSideTicket } from './ticket';

// What played tonight: a click puts one back at the end of the queue.
export const RoomSidePlayed = observer(function RoomSidePlayed(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { queue } = room;

  return (
    <RoomSideScroll compact={ui.layout.isCompact}>
      {queue.hasPlayed ? (
        <>
          {!ui.layout.isCompact && <RoomSideNote>{locale.t('played.note')}</RoomSideNote>}
          <RoomSideList>
            {queue.played.map((ticket) => (
              <RoomSideTicket
                key={ticket.id}
                ticket={ticket}
                draggable={false}
                played
                compact={ui.layout.isCompact}
                actionLabel={locale.t('played.replay', { title: ticket.title })}
                onAction={() => queue.replay(ticket.id)}
              />
            ))}
          </RoomSideList>
        </>
      ) : (
        <RoomSideEmpty>{locale.t('played.empty')}</RoomSideEmpty>
      )}
    </RoomSideScroll>
  );
});
