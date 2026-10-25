import { mediaAccessSchema } from '@cinemate/protocol';
import { Router, json } from 'express';
import * as v from 'valibot';
import type { MediaShares } from './shares.js';

// The relay asks here before every publish and every watch (spec §14.3): 200 lets them in, 401 doesn't.
// Mounted at /relay, which Caddy doesn't forward from the internet: only the relay on the Pi reaches it.
export const createMediaRouter = (shares: MediaShares): Router => {
  const router = Router();

  router.post('/auth', json({ limit: '8kb' }), (request, response) => {
    const result = v.safeParse(mediaAccessSchema, request.body);

    response.sendStatus(result.success && shares.allows(result.output) ? 200 : 401);
  });

  return router;
};
