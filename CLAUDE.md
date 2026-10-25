# Cinemate

A watch-together site for a group of friends:
- open a room, send the link, paste YouTube links or video files into a shared queue; play, pause, seek and skip are synced for everyone;
- every browser streams straight from the source at the best quality its connection allows (no Discord-style 720p/30 fps cap), and only small control messages go through the server;
- when someone falls out of step (buffering, an ad, more than 300 ms off), the room waits for them and says who ("Waiting for Dima: buffering"), then everyone restarts together on a film-leader countdown. The room is thrown away about 10 minutes after everyone leaves.

It's not one of the table games, but it's built like them: the same stack, house rules and way of working as Bluff Table (`../bluff-table`), which it was copied from. Fixes to shared parts get copied between the projects by hand. The full spec is in `.scratch/SPEC.md`. Read §0 "Decisions so far" before planning any feature: *Decided* items are settled, *Proposed* ones wait for the user's yes.

The look was approved on the style board (`.scratch/look-sketches.html`, spec D20), designed with Anthropic's `frontend-design` skill and Watch2Gether's room as the layout reference; the plan and its reasoning are in `.scratch/look-notes.md`. **Port the style board** rather than redesigning it. The sync numbers come from the spike (`.scratch/spike/`, spec §12 M−1).

## How we work
Setup commit first (M0), then each phase gets its own branch and PR (spec D23, §12). Stop for the user's review before each PR, and ask before merging.
1. **Web UI** (`feat/web-ui`), on local MobX stores against the demo room (the engine's `Cinema` in the browser, with sample viewers who buffer, lag and watch ads on cue).
2. **Backend, and connecting the UI to it** (`feat/live-rooms`).
3. **CI** (`feat/ci`). The workflow came with the setup commit and checks every PR and push to `main`.
4. **Hosting** in `../tables-host`: a `cinemate` service, a Caddy site, the tunnel route and **cinemate.timnox.dev** (spec D22).

**Verify end to end in the built-in browser,** with two or three tabs (muted) and the sync numbers on screen. Check every screen on a phone held sideways (812 × 375).

**Every control explains itself on screen.** People join by link mid-evening and never read docs: shared controls say they affect everyone, personal ones say they're only for you, and the waiting slate says who the room waits for and why.

**Never use Watch2Gether's name, logo, art or exact colours** (spec D20).

**Infrastructure in plain words:** the user is new to backends (and knows Docker and tooling), so explain servers, tunnels and networking plainly.

## Scribble Table's word lists stay secret
The user plays Scribble Table, so knowing its words would spoil it. **Never open, decode or print** `../drawing-game/modules/core-api/src/words/word-list.b64`, and never show a word from it anywhere.

## Layout
- `modules/web`: frontend. Vite + React 19 + TypeScript, Panda CSS, MobX, Ark UI, i18next (English and Ukrainian), hls.js for HLS streams, YouTube's IFrame API for YouTube.
  - **The players** (`services/players`): `YouTubeScreenPlayer` (YouTube's own bar showing, D12; gets ready by playing muted, then pausing and seeking back; reports clicks on its bar as user actions and a frozen clock as `stuck`) and `VideoScreenPlayer` (files, and HLS through hls.js), behind `ScreenPlayer`. The host in `index.ts` swaps one for the other.
  - **The sync driver** (`stores/room/screen/driver.ts`): turns the room's playback into commands (load, hold paused at the position, start at the agreed moment by the room clock) and reports twice a second. It never corrects the player while it's counted in: the room waits instead (D7). Only when excused (went on without, came in mid-video) does it catch up alone. Until someone joins, their player only gets ready.
  - **The room clock** (`stores/room/clock.ts`): pings, the engine's `clockOffset`.
  - **The screen** (`stores/room/screen/index.ts`, `waiting.ts`, `controls.ts`): the overlays (empty, ended, up next, the waiting slate, the film leader) and the control bar for files.
  - **The demo room** (`services/demo-room`): the engine's `Cinema` in the browser with sample viewers whose pretend players buffer, sit through an ad or fall behind on cue (the top bar's Demo menu). Until M2, `pnpm dev` uses it too.
  - **Screenshots of a playing YouTube video can be a stale frame** in the built-in browser: check overlays through the DOM (`window.cinemate` in dev) and take a second screenshot.
- `modules/core-api`: backend. Node + Express 5 + Colyseus 0.18 (live rooms), one process on :2573.
- `modules/protocol`: the shared contract. Intent schemas, server events, error codes, the sync numbers (`syncLimits`).
- `modules/engine`: pure logic shared by both apps: link reading (`links.ts`), the room clock (`clock.ts`), and the cinema (`cinema/`): the queue, everyone's player and the playback state machine, with every rule for keeping them together.
- `eslint.config.mjs` + `eslint-rules/`: the house lint rules for every module.
- `.scratch/`: spec, sketches, the spike and notes, ignored by git.

## Rules: read them before writing code
- **Before** creating or editing anything in `modules/web/**`, read `.claude/rules/web.md` and follow it.
- **Before** creating or editing anything in `modules/core-api/**`, read `.claude/rules/core-api.md` and follow it.
- These rules load automatically only once a matching file is opened. Read them first anyway, especially when creating new files.
- **Before calling a change done,** run `pnpm lint` and `pnpm typecheck` and fix what they report. Don't disable rules or add `eslint-disable` comments without asking.

**House lint rules** (enforced everywhere):
- **Size:** at most 40 lines per function (components included) and 300 lines per file. Blank lines and comments don't count.
- **Nested functions:** inside a function, only arrow functions. No nested `function` declarations or expressions, and no object or class methods.
- **Names:** camelCase for everything. PascalCase only for React components (which must render JSX) and for types and classes.
- **Return types:** required on every function that returns a value. Lambdas passed as arguments or JSX props are exempt.
- **Blank lines:** exactly one before and after every code block (functions, if, loops, switch, try, multi-line statements). `pnpm lint --fix` adds them.

## Commands
```bash
pnpm install
pnpm dev           # web on http://localhost:5179 + core-api on :2573 (Vite forwards /api, and /live for rooms)
pnpm demo          # web only, against the demo room (no server): for UI work
pnpm lint          # add --fix to auto-fix spacing
pnpm typecheck
pnpm test          # engine + core-api; one module: pnpm --filter @cinemate/engine test
pnpm build         # production web build (CI runs lint, typecheck, test, build on every PR and push to main)
pnpm preview       # build, then serve it with core-api on this machine (http://localhost:4179)
```
