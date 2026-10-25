# Cinemate

[![CI](https://github.com/nocs32/cinemate/actions/workflows/ci.yml/badge.svg)](https://github.com/nocs32/cinemate/actions/workflows/ci.yml)

Watch videos together with friends in the browser, in sync and at full quality.

- **A room by link:** open a room, send the link, and everyone who opens it watches the same thing. No accounts.
- **A shared queue:** paste a YouTube link or a video file (`.mp4`, `.webm`, HLS `.m3u8`). Anyone can reorder, remove or skip, and played videos can go back in.
- **Full quality:** every browser gets the video straight from the source, so each person watches at the best quality their own connection and screen allow, up to 4K60. Nothing is re-encoded or squeezed through anyone's upload, unlike sharing a screen on Discord (720p at 30 fps there).
- **In sync:** play, pause, seek and skip happen for everyone. The room keeps everyone within 300 ms of each other. In testing, two players stayed 1–2 ms apart.
- **It waits for whoever is slow, and says who:** someone buffers, watches an ad or falls behind, and the room pauses with "Waiting for Dima: buffering", then restarts everyone together on a 3, 2, 1 film-leader countdown. After 20 seconds the others can go on without them.
- **Live share:** anyone in the room can show a browser tab (with its sound) or their screen to everyone, at up to 4K60, through a relay that copies the stream without re-encoding. The queue waits until they stop. The sharer picks the quality and whether the sound goes out; everyone else's seat shows how many frames a second they get.
- **Only for you:** volume, quality, subtitles and fullscreen stay personal.
- **Chat and reactions,** in English or Ukrainian, on a computer or a phone. A room disappears about 10 minutes after the last person leaves.

> **Status:** live rooms work end to end. The web UI (M1) and the server (M2) are built: rooms by link on core-api, the shared queue with YouTube titles from YouTube, play, pause, seek and skip for everyone, the waiting slate and "Go on without", the film-leader countdown, "Up next", the chat and reactions, in English and Ukrainian, on computers and phones. Two tabs stayed within about 150 ms of the room in testing. It's hosted on a Raspberry Pi at **https://cinemate.timnox.dev**, through [tables-host](https://github.com/nocs32/tables-host).

## Stack

| Part | Tech |
|---|---|
| Web (`modules/web`) | React 19, TypeScript, Vite, Panda CSS, MobX, Ark UI, i18next, hls.js, YouTube's IFrame API |
| API (`modules/core-api`) | Node.js, Express 5 and Colyseus 0.18 (run with `tsx`) |
| Shared | `modules/protocol` (the contract between the two) and `modules/engine` (the sync rules, pure and tested) |
| Tooling | pnpm workspaces, ESLint 10 + typescript-eslint, TypeScript 6.0 |

The server keeps each room's queue and its one playback record (what's on, where, playing or paused, and since when on its own clock). Browsers learn the server's clock, so everyone knows where the video should be at any moment, and report twice a second where theirs really is. Rooms live in the server's memory only, so there is no database.

## Getting started

**Requirements:** Node.js 24 (see `.nvmrc`) and pnpm 11+.

```bash
pnpm install
pnpm dev
```

| App | URL |
|---|---|
| Web | http://localhost:5179 |
| API | http://localhost:2573 (the web dev server forwards `/api/*`, and `/live` for rooms, to it) |
| Relay | http://localhost:8889 (live share: the web dev server forwards `/media/*` to it) |

Open the web URL and click **Open a room**, then share its link: everyone who opens it is in the same room. To try it alone, open the link in a second tab. Saving a file in `modules/core-api` restarts the API, which clears every room: open a new one afterwards.

**Live share needs the relay** (MediaMTX). With Docker, `pnpm relay` runs it on this machine from `relay/`. Without Docker, point `CINEMATE_RELAY_URL` in `modules/web/.env.local` at another one (the Pi's: `http://192.168.88.48:8889`) and let it reach this machine's API with `ssh -N -R 2573:localhost:2573 pi`. Everything else works without it.

`pnpm demo` runs the web app alone against a demo room in the browser, with no API: three sample viewers come in and fill the queue with Blender's open movies, and a fourth joins later. The **Demo** menu in the top bar makes Dima buffer, gives Oleh an ad (long enough to try "Go on without Oleh"), makes Marta fall behind, or adds and removes a viewer.

The ports sit one above Deeds' (5178 and 2572) and the table games', so every project can run at the same time.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm demo` | Runs the web app alone against the demo room, for working on the UI |
| `pnpm relay` | Runs the live-share relay in Docker (`relay/`) |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |
| `pnpm test` | Runs the engine's and the API's tests |
| `pnpm build` | Builds the web app for production |
| `pnpm preview` | Builds, then serves the build with the API on this machine |

## Licence of bundled assets

Icons are from [Lucide](https://lucide.dev) (ISC, see `modules/web/src/assets/icons/lucide-license.txt`). Fonts are Unbounded and Onest (SIL Open Font License), through Fontsource.
