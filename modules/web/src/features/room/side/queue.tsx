import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSideEmpty, RoomSideList, RoomSideNote, RoomSideScroll } from './styled-components';
import { RoomSideTicket } from './ticket';

// What's up next, as tickets: drag one to change the order, or take it out.
export const RoomSideQueue = observer(function RoomSideQueue(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { queue } = room;

  return (
    <RoomSideScroll compact={ui.layout.isCompact}>
      {queue.isEmpty ? (
        <RoomSideEmpty>{locale.t('queue.empty')}</RoomSideEmpty>
      ) : (
        <>
          {!ui.layout.isCompact && <RoomSideNote>{locale.t('queue.note')}</RoomSideNote>}
          <RoomSideList>
            {queue.tickets.map((ticket, index) => (
              <RoomSideTicket
                key={ticket.id}
                ticket={ticket}
                draggable
                compact={ui.layout.isCompact}
                actionLabel={locale.t('queue.remove')}
                onAction={() => queue.remove(ticket.id)}
                onDragStart={() => queue.startDrag(ticket.id)}
                onDrop={() => queue.dropAt(index)}
                onDragEnd={queue.endDrag}
              />
            ))}
          </RoomSideList>
        </>
      )}
    </RoomSideScroll>
  );
});
