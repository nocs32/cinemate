import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSideChatLine } from './chat-line';
import { RoomSideEmpty, RoomSideFeed } from './styled-components';
import { useRoomSideScroll } from './use-scroll';

// The chat, with what happened in the room between the messages: who paused, who the room waited for.
export const RoomSideChat = observer(function RoomSideChat(): ReactElement {
  const { locale, room } = useRootStore();
  const { feed } = room;
  const listRef = useRoomSideScroll(feed.items.length);

  return (
    <RoomSideFeed ref={listRef} role="log" aria-live="polite" aria-label={locale.t('chat.log')}>
      {feed.isEmpty && <RoomSideEmpty>{locale.t('chat.empty')}</RoomSideEmpty>}
      {feed.entries.map((entry) => (
        <RoomSideChatLine key={entry.id} entry={entry} />
      ))}
    </RoomSideFeed>
  );
});
