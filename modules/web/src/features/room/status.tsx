import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LogoMark, SpinnerIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { LampButton, Spinner } from '../../ui';
import { RoomStatusCard, RoomStatusLogo, RoomStatusRoot, RoomStatusText, RoomStatusTitle } from './styled-components';

// Shown instead of the room while opening or joining it, or when there's no room to show.
export const RoomStatus = observer(function RoomStatus(): ReactElement {
  const { connection } = useRootStore().room;

  return (
    <RoomStatusRoot>
      <RoomStatusCard aria-live="polite" aria-busy={connection.isBusy}>
        <RoomStatusLogo>
          <LogoMark />
        </RoomStatusLogo>
        <RoomStatusTitle>{connection.title}</RoomStatusTitle>
        {connection.isBusy ? (
          <Spinner>
            <SpinnerIcon />
          </Spinner>
        ) : (
          <>
            <RoomStatusText>{connection.text}</RoomStatusText>
            <LampButton type="button" onClick={connection.act}>
              {connection.actionLabel}
            </LampButton>
          </>
        )}
      </RoomStatusCard>
    </RoomStatusRoot>
  );
});
