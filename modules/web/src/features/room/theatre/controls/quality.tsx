import { Menu } from '@ark-ui/react/menu';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreControlsQualityButton, RoomTheatreControlsQualityContent, RoomTheatreControlsQualityItem } from './styled-components';

// The quality, just for you: a stream's levels to pick from, or a file's one quality to read.
export const RoomTheatreControlsQuality = observer(function RoomTheatreControlsQuality(): ReactElement | null {
  const { locale, room } = useRootStore();
  const { controls } = room;

  if (!controls.quality) return null;

  if (!controls.canPickQuality) return <RoomTheatreControlsQualityButton as="span" title={locale.t('controls.quality')}>{controls.qualityLabel}</RoomTheatreControlsQualityButton>;

  return (
    <Menu.Root positioning={{ placement: 'top-end', gutter: 8 }} onSelect={(details) => controls.pickQuality(Number(details.value))}>
      <Menu.Trigger asChild>
        <RoomTheatreControlsQualityButton type="button" title={locale.t('controls.quality')}>
          {controls.qualityLabel}
        </RoomTheatreControlsQualityButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <RoomTheatreControlsQualityContent>
            <RoomTheatreControlsQualityItem value="-1">{locale.t('controls.qualityAuto')}</RoomTheatreControlsQualityItem>
            {controls.quality.levels.map((level) => (
              <RoomTheatreControlsQualityItem key={level.index} value={String(level.index)}>
                {level.label}
              </RoomTheatreControlsQualityItem>
            ))}
          </RoomTheatreControlsQualityContent>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
});
