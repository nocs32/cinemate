import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSideChat } from './chat';
import { RoomSideComposer } from './composer';
import { RoomSidePlayed } from './played';
import { RoomSideQueue } from './queue';
import { RoomSideBadge, RoomSideCount, RoomSidePanel, RoomSideRoot, RoomSideTab, RoomSideTabs } from './styled-components';

// The sidebar (the style board): what's up next, the chat, and what played tonight, with the chat
// box and reactions under all three.
export const RoomSide = observer(function RoomSide(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { side, queue, feed } = room;

  return (
    <RoomSideRoot value={side.tab} onValueChange={(details) => side.show(details.value)} aria-label={locale.t('side.label')} dimmed={room.lights.isDown}>
      <RoomSideTabs compact={ui.layout.isCompact}>
        <RoomSideTab value="queue">
          {locale.t('side.queue')} <RoomSideCount>{queue.countLabel}</RoomSideCount>
        </RoomSideTab>
        <RoomSideTab value="chat">
          {locale.t('side.chat')} {feed.hasUnread && <RoomSideBadge>{feed.unreadLabel}</RoomSideBadge>}
        </RoomSideTab>
        <RoomSideTab value="played">
          {locale.t('side.played')} <RoomSideCount>{queue.playedLabel}</RoomSideCount>
        </RoomSideTab>
      </RoomSideTabs>
      <RoomSidePanel value="queue">
        <RoomSideQueue />
      </RoomSidePanel>
      <RoomSidePanel value="chat">
        <RoomSideChat />
      </RoomSidePanel>
      <RoomSidePanel value="played">
        <RoomSidePlayed />
      </RoomSidePanel>
      <RoomSideComposer />
    </RoomSideRoot>
  );
});
