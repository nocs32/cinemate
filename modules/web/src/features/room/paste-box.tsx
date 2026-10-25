import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LinkIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import type { RoomPasteStore } from '../../stores/room/paste';
import { withoutDefault } from '../../utils';
import { PasteBoxButton, PasteBoxInput, PasteBoxNote, PasteBoxRoot, PasteBoxWrap } from './styled-components';

interface PasteBoxProps {
  paste: RoomPasteStore;
  // The top bar's, the one under the queue (its note shows above it), or the empty screen's, bigger
  // and with the lamp's button.
  size: 'bar' | 'side' | 'stage';
  placeholder: string;
  buttonLabel: string;
}

// A box to paste a video link into, with a line under it saying it was added, or why it can't play.
export const PasteBox = observer(function PasteBox({ paste, size, placeholder, buttonLabel }: PasteBoxProps): ReactElement {
  const { locale } = useRootStore();

  return (
    <PasteBoxWrap size={size}>
      <PasteBoxRoot size={size} refused={paste.isRefused} onSubmit={withoutDefault(paste.submit)}>
        {size !== 'stage' && <LinkIcon />}
        <PasteBoxInput
          value={paste.draft}
          placeholder={placeholder}
          aria-label={locale.t('paste.label')}
          maxLength={paste.maxLength}
          spellCheck={false}
          onChange={(event) => paste.setDraft(event.target.value)}
        />
        <PasteBoxButton type="submit" size={size} disabled={!paste.canAdd}>
          {buttonLabel}
        </PasteBoxButton>
      </PasteBoxRoot>
      {paste.note && (
        <PasteBoxNote size={size} refused={paste.isRefused} role="status">
          {paste.note}
        </PasteBoxNote>
      )}
    </PasteBoxWrap>
  );
});
