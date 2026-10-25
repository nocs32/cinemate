import { Menu } from '@ark-ui/react/menu';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { demoActions, type DemoAction } from '../../../services';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarMenuContent, RoomTopBarMenuItem, RoomTopBarMenuTitle, RoomTopBarPill } from './styled-components';

// The demo room's buttons (spec §12 M1): put a sample viewer into trouble, or add and remove one.
export const RoomTopBarDemo = observer(function RoomTopBarDemo(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <Menu.Root positioning={{ placement: 'bottom-end', gutter: 8 }} onSelect={(details) => room.runDemo(details.value as DemoAction)}>
      <Menu.Trigger asChild>
        <RoomTopBarPill type="button" accent>
          {locale.t('demo.label')}
        </RoomTopBarPill>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <RoomTopBarMenuContent>
            <RoomTopBarMenuTitle>{locale.t('demo.title')}</RoomTopBarMenuTitle>
            {demoActions.map((action) => (
              <RoomTopBarMenuItem key={action} value={action}>
                {locale.t(`demo.${action}`)}
              </RoomTopBarMenuItem>
            ))}
          </RoomTopBarMenuContent>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
});
