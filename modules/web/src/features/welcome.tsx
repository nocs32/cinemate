import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LogoMark } from '../assets';
import { useRootStore } from '../stores/use-root-store';
import { WelcomeLanguage, WelcomeLogo, WelcomeRoot, WelcomeText, WelcomeTitle } from './styled-components';

// Stands in for the room until the web UI (M1) is built.
export const Welcome = observer(function Welcome(): ReactElement {
  const { locale } = useRootStore();

  return (
    <WelcomeRoot>
      <WelcomeLogo>
        <LogoMark />
      </WelcomeLogo>
      <WelcomeTitle>{locale.t('welcome.title')}</WelcomeTitle>
      <WelcomeText>{locale.t('welcome.text')}</WelcomeText>
      <WelcomeLanguage type="button" onClick={locale.toggle} aria-label={locale.toggleLabel}>
        {locale.code}
      </WelcomeLanguage>
    </WelcomeRoot>
  );
});
