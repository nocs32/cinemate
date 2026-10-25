import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { LampButton, OutlineButton } from '../../../ui';
import { RoomSideTicketAction, RoomSideTicketRemoveNowActions, RoomSideTicketRemoveNowContent, RoomSideTicketRemoveNowText, RoomSideTicketRemoveNowTitle } from './styled-components';

// The ✕ on the video playing now: it asks first, because it stops the video for everyone and the next
// one starts.
export const RoomSideTicketRemoveNow = observer(function RoomSideTicketRemoveNow(): ReactElement {
  const { locale, room } = useRootStore();
  const { queue } = room;

  return (
    <Popover.Root open={queue.isConfirmingRemoveNow} onOpenChange={(details) => queue.toggleRemoveNow(details.open)} positioning={{ placement: 'bottom-end', gutter: 6 }} lazyMount unmountOnExit>
      <Popover.Trigger asChild>
        <RoomSideTicketAction type="button" aria-label={locale.t('queue.remove')} title={locale.t('queue.remove')}>
          <CloseIcon />
        </RoomSideTicketAction>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <RoomSideTicketRemoveNowContent>
            <RoomSideTicketRemoveNowTitle>{locale.t('queue.removeNow.title')}</RoomSideTicketRemoveNowTitle>
            <RoomSideTicketRemoveNowText>{queue.removeNowText}</RoomSideTicketRemoveNowText>
            <RoomSideTicketRemoveNowActions>
              <LampButton type="button" size="sm" onClick={queue.removeNow}>
                {locale.t('queue.removeNow.confirm')}
              </LampButton>
              <OutlineButton type="button" size="sm" onClick={() => queue.toggleRemoveNow(false)}>
                {locale.t('queue.removeNow.cancel')}
              </OutlineButton>
            </RoomSideTicketRemoveNowActions>
          </RoomSideTicketRemoveNowContent>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});
