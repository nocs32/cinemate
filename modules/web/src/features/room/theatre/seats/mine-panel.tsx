import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { LampButton } from '../../../../ui';
import { withoutDefault } from '../../../../utils';
import { ColorPicker } from '../../color-picker';
import {
  RoomTheatreSeatsMinePanelField,
  RoomTheatreSeatsMinePanelForm,
  RoomTheatreSeatsMinePanelHint,
  RoomTheatreSeatsMinePanelInput,
  RoomTheatreSeatsMinePanelLabel,
  RoomTheatreSeatsMinePanelRoot,
  RoomTheatreSeatsMinePanelTitle,
} from './styled-components';

// Your name and colour, saved in this browser for every room.
export const RoomTheatreSeatsMinePanel = observer(function RoomTheatreSeatsMinePanel(): ReactElement {
  const { locale, room } = useRootStore();
  const { profile } = room;

  return (
    <RoomTheatreSeatsMinePanelRoot>
      <RoomTheatreSeatsMinePanelForm onSubmit={withoutDefault(profile.save)}>
        <RoomTheatreSeatsMinePanelTitle>{locale.t('profile.title')}</RoomTheatreSeatsMinePanelTitle>
        <RoomTheatreSeatsMinePanelField>
          <RoomTheatreSeatsMinePanelLabel htmlFor="profile-name">{locale.t('join.name')}</RoomTheatreSeatsMinePanelLabel>
          <RoomTheatreSeatsMinePanelInput id="profile-name" value={profile.name} maxLength={profile.maxLength} autoComplete="nickname" onChange={(event) => profile.setName(event.target.value)} />
        </RoomTheatreSeatsMinePanelField>
        <RoomTheatreSeatsMinePanelField>
          <RoomTheatreSeatsMinePanelLabel as="span">{locale.t('join.color')}</RoomTheatreSeatsMinePanelLabel>
          <ColorPicker swatches={profile.swatches} onPick={profile.pick} hasTaken={profile.hasTakenColors} />
        </RoomTheatreSeatsMinePanelField>
        <LampButton type="submit" disabled={!profile.canSave}>
          {locale.t('profile.save')}
        </LampButton>
        <RoomTheatreSeatsMinePanelHint>{locale.t('profile.hint')}</RoomTheatreSeatsMinePanelHint>
      </RoomTheatreSeatsMinePanelForm>
    </RoomTheatreSeatsMinePanelRoot>
  );
});
