import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { cinemaRoomName } from '@cinemate/protocol';
import { CinemaRoom } from './cinema-room/index.js';
import { config } from './config.js';
import { describeError, errorMiddleware, notFoundMiddleware } from './errors/index.js';
import { healthRouter } from './health/index.js';
import { logger } from './logger.js';

// One HTTP server for both: Colyseus answers its matchmaking routes and the WebSocket upgrades
// for live rooms; every other request falls through to the Express app below.
const server = new Server({
  transport: new WebSocketTransport(),
  greet: false,
  express: (app) => {
    app.use('/api/health', healthRouter);
    app.use('/api', notFoundMiddleware);
    app.use(errorMiddleware);
  },
});

server.define(cinemaRoomName, CinemaRoom);

server.listen(config.port).then(
  () => {
    logger.info('core-api listening', { url: `http://localhost:${config.port}` });
  },
  (error: unknown) => {
    logger.error('core-api failed to start', { port: config.port, error: describeError(error) });
    process.exitCode = 1;
  },
);
