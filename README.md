# Cinemate

[![CI](https://github.com/nocs32/cinemate/actions/workflows/ci.yml/badge.svg)](https://github.com/nocs32/cinemate/actions/workflows/ci.yml)

Watch videos together with friends in the browser, in sync and at full quality.

- **A room by link:** open a room, send the link, and everyone who opens it watches the same thing. No accounts.
- **A shared queue:** paste a YouTube link or a video file (`.mp4`, `.webm`, HLS `.m3u8`). Anyone can reorder, remove or skip, and played videos can go back in.
- **Full quality:** every browser gets the video straight from the source, so each person watches at the best quality their own connection and screen allow, up to 4K60. Nothing is re-encoded or squeezed through anyone's upload, unlike sharing a screen on Discord (720p at 30 fps there).
- **In sync:** play, pause, seek and skip happen for everyone. The room keeps everyone within 300 ms of each other. In testing, two players stayed 1–2 ms apart.
- **It waits for whoever is slow, and says who:** someone buffers, watches an ad or falls behind, and the room pauses with "Waiting for Dima: buffering", then restarts everyone together on a 3, 2, 1 film-leader countdown. After 20 seconds the others can go on without them.
- **Only for you:** volume, quality, subtitles and fullscreen stay personal.
- **Chat and reactions,** in English or Ukrainian, on a computer or a phone. A room disappears about 10 minutes after the last person leaves.

> **Status:** setup (M0). The rules for keeping a room in sync are built and tested in the engine; the web UI comes next.

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

`pnpm demo` runs the web app alone against a demo room in the browser, with no API.

The ports sit one above Deeds' (5178 and 2572) and the table games', so every project can run at the same time.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm demo` | Runs the web app alone against the demo room, for working on the UI |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |
| `pnpm test` | Runs the engine's and the API's tests |
| `pnpm build` | Builds the web app for production |
| `pnpm preview` | Builds, then serves the build with the API on this machine |

## Licence of bundled assets

Icons are from [Lucide](https://lucide.dev) (ISC, see `modules/web/src/assets/icons/lucide-license.txt`). Fonts are Unbounded and Onest (SIL Open Font License), through Fontsource.
