import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { withoutDefault } from '../../../utils';
import { RoomSideComposerInput, RoomSideComposerNote, RoomSideComposerReact, RoomSideComposerReactions, RoomSideComposerRoot } from './styled-components';

// The chat box, and the reactions that float up over everyone's screen.
export const RoomSideComposer = observer(function RoomSideComposer(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { feed, chatPace, reactions } = room;

  return (
    <>
      {chatPace.note && <RoomSideComposerNote role="status">{chatPace.note}</RoomSideComposerNote>}
      <RoomSideComposerRoot compact={ui.layout.isCompact} onSubmit={withoutDefault(feed.send)}>
        <RoomSideComposerInput
          value={feed.draft}
          placeholder={locale.t('chat.placeholder')}
          aria-label={locale.t('chat.message')}
          maxLength={feed.maxLength}
          enterKeyHint="send"
          onChange={(event) => feed.setDraft(event.target.value)}
        />
        {!ui.layout.isCompact && (
          <RoomSideComposerReactions>
            {reactions.quickButtons.map((button) => (
              <RoomSideComposerReact key={button.emoji} type="button" aria-label={button.label} title={button.label} onClick={() => reactions.fire(button.emoji)}>
                {button.emoji}
              </RoomSideComposerReact>
            ))}
          </RoomSideComposerReactions>
        )}
      </RoomSideComposerRoot>
    </>
  );
});
