import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { SeatShape } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { OutlineButton } from '../../../../ui';
import {
  RoomTheatreScreenScrim,
  RoomTheatreScreenSlateGoOn,
  RoomTheatreScreenSlateHint,
  RoomTheatreScreenSlateLine,
  RoomTheatreScreenSlateReason,
  RoomTheatreScreenSlateRoot,
  RoomTheatreScreenSlateTally,
  RoomTheatreScreenSlateTitle,
  RoomTheatreScreenSlateWho,
} from './styled-components';

// The waiting slate (D7): "Waiting for Dima", why and for how long, how often tonight, and after 20 s
// "Go on without Dima" for everyone else (D10).
export const RoomTheatreScreenSlate = observer(function RoomTheatreScreenSlate(): ReactElement {
  const { waiting } = useRootStore().room.screen;
  const { first } = waiting;

  return (
    <RoomTheatreScreenScrim>
      <RoomTheatreScreenSlateRoot role="status" aria-live="polite">
        {first && (
          <RoomTheatreScreenSlateWho tone={first.color}>
            <SeatShape />
          </RoomTheatreScreenSlateWho>
        )}
        <RoomTheatreScreenSlateTitle>{waiting.title}</RoomTheatreScreenSlateTitle>
        <RoomTheatreScreenSlateLine>
          <RoomTheatreScreenSlateReason>{waiting.reason}</RoomTheatreScreenSlateReason> {waiting.others}
        </RoomTheatreScreenSlateLine>
        {waiting.tally && <RoomTheatreScreenSlateTally>{waiting.tally}</RoomTheatreScreenSlateTally>}
        {waiting.canGoOn && (
          <RoomTheatreScreenSlateGoOn>
            <OutlineButton type="button" onClick={waiting.goOn}>
              {waiting.goOnLabel}
            </OutlineButton>
            <RoomTheatreScreenSlateHint>{waiting.goOnHint}</RoomTheatreScreenSlateHint>
          </RoomTheatreScreenSlateGoOn>
        )}
      </RoomTheatreScreenSlateRoot>
    </RoomTheatreScreenScrim>
  );
});
