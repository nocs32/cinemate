import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { cinemaRoomName } from '@cinemate/protocol';
import { CinemaRoom } from './cinema-room/index.js';
import { config } from './config.js';
import { describeError, errorMiddleware, notFoundMiddleware } from './errors/index.js';
import { healthRouter } from './health/index.js';
import { createMediaRouter, MediaShares } from './media/index.js';
import { logger } from './logger.js';

// Every live share in every room, for the relay's questions (spec §14.3).
const shares = new MediaShares();

// One HTTP server for both: Colyseus answers its matchmaking routes and the WebSocket upgrades
// for live rooms; every other request falls through to the Express app below.
const server = new Server({
  transport: new WebSocketTransport(),
  greet: false,
  express: (app) => {
    app.use('/api/health', healthRouter);
    // Not under /api: Caddy forwards /api from the internet, and only the relay may ask this.
    app.use('/relay', createMediaRouter(shares));
    app.use('/api', notFoundMiddleware);
    app.use(errorMiddleware);
  },
});

server.define(cinemaRoomName, CinemaRoom, { shares });

server.listen(config.port).then(
  () => {
    logger.info('core-api listening', { url: `http://localhost:${config.port}` });
  },
  (error: unknown) => {
    logger.error('core-api failed to start', { port: config.port, error: describeError(error) });
    process.exitCode = 1;
  },
);
