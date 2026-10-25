import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTheatreScreenChip } from './styled-components';

// The room went on without you, or you came in mid-video: you're getting back in step on your own.
export const RoomTheatreScreenCatchingUp = observer(function RoomTheatreScreenCatchingUp(): ReactElement {
  const { locale } = useRootStore();

  return <RoomTheatreScreenChip role="status">{locale.t('screen.catchingUp')}</RoomTheatreScreenChip>;
});
