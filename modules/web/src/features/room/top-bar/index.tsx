import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LogoMark } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { PasteBox } from '../paste-box';
import { RoomTopBarDemo } from './demo';
import { RoomTopBarInvite } from './invite';
import { RoomTopBarLanguage } from './language';
import { RoomTopBarBrand, RoomTopBarCount, RoomTopBarRight, RoomTopBarRoot } from './styled-components';

// The top bar (the style board): the wordmark (a link to the start page), the paste box in the middle, and on the right how many
// are here, the demo's buttons, the language and Copy invite link, the one bright button.
export const RoomTopBar = observer(function RoomTopBar(): ReactElement {
  const { locale, room, ui } = useRootStore();

  return (
    <RoomTopBarRoot dimmed={room.lights.isDown} compact={ui.layout.isCompact}>
      <RoomTopBarBrand href="/" aria-label={locale.t('brand')} title={locale.t('home')}>
        <LogoMark />
        {!ui.layout.isCompact && locale.t('brand')}
      </RoomTopBarBrand>
      <PasteBox paste={room.paste} size="bar" placeholder={locale.t('paste.placeholder')} buttonLabel={locale.t('paste.add')} />
      <RoomTopBarRight>
        {!ui.layout.isCompact && <RoomTopBarCount>{room.presence.countLabel}</RoomTopBarCount>}
        {room.demo && <RoomTopBarDemo />}
        <RoomTopBarLanguage />
        <RoomTopBarInvite />
      </RoomTopBarRight>
    </RoomTopBarRoot>
  );
});
