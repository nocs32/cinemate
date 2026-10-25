import { styled } from 'styled-system/jsx';

export const WelcomeRoot = styled('main', {
  base: { height: '100%', display: 'grid', placeContent: 'center', justifyItems: 'start', gap: '12px', padding: '32px', maxWidth: '560px', marginInline: 'auto' },
});

export const WelcomeLogo = styled('span', {
  base: { display: 'inline-flex', '& svg': { width: '44px', height: '44px' } },
});

export const WelcomeTitle = styled('h1', {
  base: { margin: '0', fontFamily: 'display', fontSize: '34px', fontWeight: '700', letterSpacing: '-0.02em' },
});

export const WelcomeText = styled('p', {
  base: { margin: '0', color: 'fg.muted' },
});

export const WelcomeLanguage = styled('button', {
  base: { marginTop: '8px', border: '1px solid', borderColor: 'border.seam', bg: 'transparent', borderRadius: 'full', paddingInline: '12px', height: '30px', fontSize: '13px', fontWeight: '600', color: 'fg.muted', cursor: 'pointer' },
});
