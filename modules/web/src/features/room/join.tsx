import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { LampButton } from '../../ui';
import { withoutDefault } from '../../utils';
import { RoomJoinSwatch } from './join-swatch';
import { RoomJoinCard, RoomJoinField, RoomJoinHint, RoomJoinInput, RoomJoinLabel, RoomJoinRoot, RoomJoinSwatches, RoomJoinText, RoomJoinTitle } from './styled-components';

// The join card (spec §9) for someone who came in by link: who's here and what's on, your name and
// colour, then Join. The click is also what lets the browser play sound.
export const RoomJoin = observer(function RoomJoin(): ReactElement {
  const { locale, room } = useRootStore();
  const { join } = room;

  return (
    <RoomJoinRoot>
      <RoomJoinCard onSubmit={withoutDefault(join.enter)} aria-labelledby="join-title">
        <RoomJoinTitle id="join-title">{locale.t('join.title')}</RoomJoinTitle>
        <RoomJoinText>{join.watchingLabel}</RoomJoinText>
        <RoomJoinField>
          <RoomJoinLabel htmlFor="join-name">{locale.t('join.name')}</RoomJoinLabel>
          <RoomJoinInput id="join-name" value={join.name} maxLength={join.maxLength} autoComplete="nickname" onChange={(event) => join.setName(event.target.value)} />
        </RoomJoinField>
        <RoomJoinField>
          <RoomJoinLabel as="span">{locale.t('join.color')}</RoomJoinLabel>
          <RoomJoinSwatches>
            {join.swatches.map((swatch) => (
              <RoomJoinSwatch key={swatch.color} swatch={swatch} onPick={join.pick} />
            ))}
          </RoomJoinSwatches>
        </RoomJoinField>
        <LampButton type="submit" size="lg" disabled={!join.canEnter}>
          {locale.t('join.go')}
        </LampButton>
        <RoomJoinHint>{locale.t('join.hint')}</RoomJoinHint>
      </RoomJoinCard>
    </RoomJoinRoot>
  );
});
