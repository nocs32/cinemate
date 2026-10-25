import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const coreApiUrl = 'http://localhost:2573';

// Live rooms: the Colyseus client talks to /live (matchmaking over HTTP, then a WebSocket);
// core-api serves those routes at its root.
const liveProxy = {
  target: coreApiUrl,
  ws: true,
  rewrite: (path: string): string => path.replace(/^\/live/u, ''),
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
    proxy: { '/api': coreApiUrl, '/live': liveProxy },
  },
  // `pnpm preview`: the production build on this machine. The preview reuses `server.proxy`, so /api
  // and /live reach core-api exactly as in dev. Hosting is the Pi's (spec D22).
  preview: {
    host: '127.0.0.1',
    port: 4179,
    strictPort: true,
  },
});
