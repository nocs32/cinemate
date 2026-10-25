import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LogoMark } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { LampButton } from '../../ui';
import {
  RoomLandingBrand,
  RoomLandingLanguage,
  RoomLandingNote,
  RoomLandingPoint,
  RoomLandingPoints,
  RoomLandingRoot,
  RoomLandingText,
  RoomLandingTitle,
} from './styled-components';

// The start page at `/`: what Cinemate does, and Open a room. That click also lets the browser play
// sound, so whoever opens the room skips the join card.
export const RoomLanding = observer(function RoomLanding(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomLandingRoot>
      <RoomLandingBrand>
        <LogoMark />
        {locale.t('brand')}
        <RoomLandingLanguage type="button" onClick={locale.toggle} aria-label={locale.toggleLabel}>
          {locale.code}
        </RoomLandingLanguage>
      </RoomLandingBrand>
      <RoomLandingTitle>{locale.t('landing.title')}</RoomLandingTitle>
      <RoomLandingText>{locale.t('landing.text')}</RoomLandingText>
      <RoomLandingPoints>
        <RoomLandingPoint>{locale.t('landing.quality')}</RoomLandingPoint>
        <RoomLandingPoint>{locale.t('landing.sync')}</RoomLandingPoint>
        <RoomLandingPoint>{locale.t('landing.wait')}</RoomLandingPoint>
      </RoomLandingPoints>
      <LampButton type="button" size="lg" onClick={room.connection.create}>
        {locale.t('landing.open')}
      </LampButton>
      <RoomLandingNote>{locale.t('landing.note')}</RoomLandingNote>
    </RoomLandingRoot>
  );
});
