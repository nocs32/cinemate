import '@fontsource-variable/onest';
import '@fontsource-variable/unbounded';
import './index.css';
import './stores/configure-mobx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { syncDocumentLanguage } from './services/document-language';
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

createRoot(rootElement).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
