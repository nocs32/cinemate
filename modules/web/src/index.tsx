import '@fontsource-variable/onest';
import '@fontsource-variable/unbounded';
import './index.css';
import './stores/configure-mobx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { watchActivity } from './services/activity';
import { syncDocumentLanguage } from './services/document-language';
import { watchKeys } from './services/keyboard';
import { watchLayout } from './services/layout';
import { createRootStore } from './stores';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element in index.html');
}

const store = createRootStore();

// Development only: the root store as `window.cinemate`, for poking at it from the console.
if (import.meta.env.DEV) {
  Object.assign(window, { cinemate: store });
}

syncDocumentLanguage(store.locale);
watchLayout(store.ui.layout);
watchActivity(store.room.lights, store.room.clock);
watchKeys(store.room.controls);
store.room.open();

createRoot(rootElement).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
