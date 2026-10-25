---
paths:
  - "modules/core-api/**"
---

# Core API rules (`modules/core-api`)

Node + Express 5 for HTTP, and Colyseus 0.18 for the live rooms. These rules come on top of the lint rules in `eslint.config.mjs` and follow the same ideas as the web rules: thin edges, small named units, and logic in small state machines.

**Colyseus specifics:**
- One process serves both: `new Server({ transport: new WebSocketTransport(), express: (app) => … })` in `src/index.ts`. Colyseus answers `/matchmake/*` and the WebSocket upgrades; everything else falls through to Express. No Redis (one process).
- Room classes extend Colyseus `Room<{ client }>`. Class fields like `maxClients` and `autoDispose` are fine (Colyseus re-installs its accessors in `__init`).
- **No Schema state.** The room sends its own messages through `CinemaRoomOutbox` (the shapes are `CinemaEvents` in the protocol): `view` (the whole room, sent when it changed), `feed`, `pong` (the room clock), and `reaction` and `error` straight out. Messages arrive in order, which state patches don't promise. A browser gets nothing until it sends `sync`.
- **Nothing in a room is secret,** so everyone gets the same view.
- **The cinema's rules live in the engine** (`Cinema` in `@cinemate/engine`): the queue, everyone's player and the playback record. The room feeds it intents and reports with the server's `now`, ticks it a few times a second, and turns its notices into feed lines. The demo room runs the same engine in the browser.
- Message handlers follow rule 3 through the room's `#on(type, handle)`: valibot schema from the protocol, then the rate limit, then one call. Don't pass a schema to Colyseus's own `onMessage`/`validate`: a failed check there disconnects the sender. Refusals go back as an `error` event (`{ code }`).
- Join options are checked in `onJoin`; a refused join throws `ServerError` with the typed code as its message.
- Tests: unit tests per part (`*.test.ts` next to it) and room tests through a real server with `@colyseus/testing` (`index.test.ts`, port 2596). Run `pnpm --filter @cinemate/core-api test`.

## 1. Names follow the owner
A unit that belongs to another starts with its owner's name: `CinemaRoom` → `CinemaRoomMembers`, `CinemaRoomOutbox`. Shared building blocks are named for what they are: `logger`, `limits`.

## 2. One unit per file
- One class, one router or one handler group per file.
- Files and folders are kebab-case, named after what they hold. The lint rule `local/kebab-case-filenames` enforces it.
- A unit with sub-units becomes a folder: `index.ts` holds the main unit, and each sub-unit gets a short-named file next to it (`cinema-room/index.ts`, `cinema-room/members.ts`).

## 3. Edges are thin
Express route handlers and live message handlers do exactly three things:
1. Validate the input with the shared schema.
2. Call **one** method on a service or room class.
3. Send the result, or a typed error.

No rules, storage or calculations inside handlers.

## 4. Logic lives in small state-machine classes
- **Composed rooms.** `CinemaRoom` only wires its parts together: members (names and colours), the cinema (the engine's `Cinema` on the room's clock), titles (YouTube's oEmbed), the feed, the lifecycle (the 10-minute empty timer), rate limits and the outbox.
- **Explicit states.** The room's lifecycle is `'active' | 'emptyGrace' | 'closed'`; playback is `empty → loading → playing ⇄ paused`, with `loading` again for every seek and every wait, then `upNext` or `ended` (spec §10.3).
- **Transitions** are methods named after events: `join`, `leave`, `add`, `play`, `seek`, `report`, `goOnWithout`. An invalid one is rejected with a typed error code.
- **Tests.** Each state-machine class has unit tests for its transitions, including the rejected ones.

## 5. The server decides; clients only ask
- **Intents, not results.** Clients send intents such as `play` or `seek`, and reports of what their own player does. The server works out where the room is. Never accept a finished result from a client, like "everyone is ready".
- **Validate everything.** Check every message and request body against its schema: reject unknown fields, clamp numbers to sane ranges, and check report times against the server's clock.
- **The server never fetches a pasted address.** It reads the link (engine `parseMediaLink`) and only ever calls YouTube's oEmbed endpoint with a parsed video id (spec §4.2).
- **Limits in one place.** Rate limits and size caps are constants in a single `limits.ts` (spec §10.5).

## 6. Every piece of memory has an owner
- **No database.** Rooms, queues and players live in memory.
- **Cleanup.** Every `Map`, timer and interval belongs to a class that clears it in `dispose()`.
- **No module-level mutable state**, except the composition root (`src/index.ts`), which creates the long-lived instances.

## 7. Config, errors and logs
- **Config:** environment variables are read and validated once in `src/config.ts`. Nothing else reads `process.env`.
- **Errors:** use typed error codes shared with the web app, like `'NOTHING_PLAYING'` or `'RATE_LIMITED'`. Never use raw strings.
- **Logs:** log through `src/logger.ts` with context such as `roomId` and `sessionId`. No `console.log` anywhere else. Never log pasted links or chat lines.

## 8. One shared contract
- Intent schemas, server events, error codes and name rules live in `@cinemate/protocol`. Both apps import them. Never redefine them in core-api.
- Changing an intent's or an event's shape bumps `cinemaProtocolVersion`.
