import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarPill } from './styled-components';

export const RoomTopBarLanguage = observer(function RoomTopBarLanguage(): ReactElement {
  const { locale } = useRootStore();

  return (
    <RoomTopBarPill type="button" onClick={locale.toggle} aria-label={locale.toggleLabel} title={locale.toggleLabel}>
      {locale.code}
    </RoomTopBarPill>
  );
});
