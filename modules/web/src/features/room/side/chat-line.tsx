import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../stores/room/feed';
import { RoomSideChatLineAuthor, RoomSideChatLineMessage, RoomSideChatLineSystem } from './styled-components';

interface RoomSideChatLineProps {
  entry: FeedEntry;
}

// A chat message with its author's name in their colour, or a quieter line about what happened.
export function RoomSideChatLine({ entry }: RoomSideChatLineProps): ReactElement {
  if (entry.kind === 'system') {
    return (
      <RoomSideChatLineSystem warning={entry.isWarning} title={entry.timeLabel}>
        {entry.authorName} {entry.text}
      </RoomSideChatLineSystem>
    );
  }

  return (
    <RoomSideChatLineMessage title={entry.timeLabel}>
      <RoomSideChatLineAuthor tone={entry.authorColor}>{entry.authorName}</RoomSideChatLineAuthor>
      {entry.text}
    </RoomSideChatLineMessage>
  );
}
