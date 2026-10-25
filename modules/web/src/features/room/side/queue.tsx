import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { PasteBox } from '../paste-box';
import { RoomSideEmpty, RoomSideFooter, RoomSideList, RoomSideNote, RoomSideScroll } from './styled-components';
import { RoomSideTicket } from './ticket';

// What's up next, as tickets: drag one to change the order, or take it out. A link pasted under the
// queue joins the end of it.
export const RoomSideQueue = observer(function RoomSideQueue(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { queue } = room;

  return (
    <>
      <RoomSideScroll compact={ui.layout.isCompact}>
      {queue.isEmpty ? (
        <RoomSideEmpty>{locale.t('queue.empty')}</RoomSideEmpty>
      ) : (
        <>
          {!ui.layout.isCompact && <RoomSideNote>{locale.t('queue.note')}</RoomSideNote>}
          <RoomSideList>
            {queue.nowTicket && (
              <RoomSideTicket ticket={queue.nowTicket} draggable={false} compact={ui.layout.isCompact} actionLabel={locale.t('queue.remove')} onAction={() => queue.toggleRemoveNow(true)} />
            )}
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
      <RoomSideFooter compact={ui.layout.isCompact}>
        <PasteBox paste={room.queuePaste} size="side" placeholder={locale.t('queue.paste')} buttonLabel={locale.t('paste.add')} />
      </RoomSideFooter>
    </>
  );
});
