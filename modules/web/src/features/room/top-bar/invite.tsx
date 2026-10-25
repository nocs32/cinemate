import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon, LinkIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarInviteButton } from './styled-components';

export const RoomTopBarInvite = observer(function RoomTopBarInvite(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { share } = room;

  return (
    <RoomTopBarInviteButton type="button" onClick={share.copy} title={locale.t('share.linkTitle')} aria-live="polite" compact={ui.layout.isCompact}>
      {share.isCopied ? <CheckIcon /> : <LinkIcon />}
      {share.inviteLabel}
    </RoomTopBarInviteButton>
  );
});
