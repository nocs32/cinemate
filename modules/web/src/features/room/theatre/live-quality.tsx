import { Menu } from '@ark-ui/react/menu';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTheatreLiveQualityButton, RoomTheatreLiveQualityContent, RoomTheatreLiveQualityItem } from './styled-components';

// The quality everyone gets of your share (D32), changeable while it's live.
export const RoomTheatreLiveQuality = observer(function RoomTheatreLiveQuality(): ReactElement {
  const { locale, room } = useRootStore();
  const { sharer } = room.live;

  return (
    <Menu.Root positioning={{ placement: 'top-end', gutter: 8 }} onSelect={(details) => sharer.pickQuality(details.value)}>
      <Menu.Trigger asChild>
        <RoomTheatreLiveQualityButton type="button" title={locale.t('live.quality.label')}>
          {sharer.qualityLabel}
        </RoomTheatreLiveQualityButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <RoomTheatreLiveQualityContent>
            {sharer.qualityOptions.map((option) => (
              <RoomTheatreLiveQualityItem key={option.value} value={option.value} chosen={option.value === sharer.quality}>
                {option.label}
              </RoomTheatreLiveQualityItem>
            ))}
          </RoomTheatreLiveQualityContent>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
});
