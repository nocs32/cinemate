// The browser lets a page play sound only once the person has clicked or typed on it.
export const canPlaySound = (): boolean => navigator.userActivation?.hasBeenActive ?? true;

// A silent tab, for testing without anyone hearing it: `sessionStorage['cinemate:silent'] = '1'`.
export const isSilent = (): boolean => {
  try {
    return window.sessionStorage.getItem('cinemate:silent') === '1';
  } catch {
    return false;
  }
};
