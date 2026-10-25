import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type ProxyOptions } from 'vite';

const coreApiUrl = 'http://localhost:2573';

// Live rooms: the Colyseus client talks to /live (matchmaking over HTTP, then a WebSocket);
// core-api serves those routes at its root.
const liveProxy = {
  target: coreApiUrl,
  ws: true,
  rewrite: (path: string): string => path.replace(/^\/live/u, ''),
};

// Live share: the relay answers WHIP and WHEP at its root: `pnpm relay` (Docker) on this machine, or
// another one set in .env.local as CINEMATE_RELAY_URL (say, the Pi's, which then needs to reach this
// core-api: `ssh -N -R 2573:localhost:2573 pi`). Its session addresses get /media put back in front, as
// Caddy does on the Pi.
const relayUrl = loadEnv('development', fileURLToPath(new URL('.', import.meta.url)), 'CINEMATE_').CINEMATE_RELAY_URL ?? 'http://localhost:8889';

const mediaProxy: ProxyOptions = {
  target: relayUrl,
  rewrite: (path: string): string => path.replace(/^\/media/u, ''),
  configure: (proxy) => {
    proxy.on('proxyRes', (response) => {
      const { location } = response.headers;

      if (location?.startsWith('/') && !location.startsWith('/media/')) response.headers.location = `/media${location}`;
    });
  },
};

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      'styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
    },
  },
  // 5179 and 4179, one above Deeds' 5178 and 4178 (the table games have 5173 to 5177), so every
  // project may run at once (spec D21).
  server: {
    port: 5179,
    strictPort: true,
    proxy: { '/api': coreApiUrl, '/live': liveProxy, '/media': mediaProxy },
  },
  // `pnpm preview`: the production build on this machine. The preview reuses `server.proxy`, so /api
  // and /live reach core-api exactly as in dev. Hosting is the Pi's (spec D22).
  preview: {
    host: '127.0.0.1',
    port: 4179,
    strictPort: true,
  },
});
