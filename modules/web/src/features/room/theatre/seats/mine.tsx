import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { ViewerView } from '../../../../stores/room/presence';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreSeatsMinePanel } from './mine-panel';
import { RoomTheatreSeatsSeat } from './seat';
import { RoomTheatreSeatsItemRoot, RoomTheatreSeatsMineButton } from './styled-components';

interface RoomTheatreSeatsMineProps {
  view: ViewerView;
}

// Your own seat: click it to change your name and colour.
export const RoomTheatreSeatsMine = observer(function RoomTheatreSeatsMine({ view }: RoomTheatreSeatsMineProps): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { profile } = room;

  return (
    <RoomTheatreSeatsItemRoot compact={ui.layout.isCompact}>
      <Popover.Root open={profile.isOpen} onOpenChange={(details) => profile.toggle(details.open)} positioning={{ placement: 'top-start', gutter: 10 }} lazyMount unmountOnExit>
        <Popover.Trigger asChild>
          <RoomTheatreSeatsMineButton type="button" aria-label={profile.editLabel} title={profile.editLabel}>
            <RoomTheatreSeatsSeat view={view} compact={ui.layout.isCompact} youLabel={locale.t('seats.you')} />
          </RoomTheatreSeatsMineButton>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <RoomTheatreSeatsMinePanel />
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </RoomTheatreSeatsItemRoot>
  );
});
