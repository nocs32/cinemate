import { randomUUID } from 'node:crypto';
import { ErrorCode, Room, ServerError, type Client } from '@colyseus/core';
import { Cinema, CinemaRuleError, parseMediaLink, type CinemaNotice } from '@cinemate/engine';
import {
  cinemaIntentSchemas,
  cinemaJoinOptionsSchema,
  cinemaProtocolVersion,
  feedMaxItems,
  type CinemaErrorCode,
  type CinemaEvents,
  type CinemaIntents,
  type CinemaIntentType,
  type CinemaJoinOptions,
  type ViewerColor,
} from '@cinemate/protocol';
import { customAlphabet } from 'nanoid';
import * as v from 'valibot';
import { limits } from '../limits.js';
import { logger } from '../logger.js';
import { CinemaRoomError } from './error.js';
import { CinemaRoomFeed } from './feed.js';
import { cinemaRoomHandlers, type CinemaRoomHandlers } from './intents.js';
import { CinemaRoomLifecycle, type Schedule } from './lifecycle.js';
import { CinemaRoomMembers } from './members.js';
import { CinemaRoomOutbox } from './outbox.js';
import { CinemaRoomRateLimits } from './rate-limits.js';
import { fetchYoutubeTitle, type TitleLookup } from './titles.js';
import { cinemaView } from './view.js';

export type CinemaClient = Client<{ messages: CinemaEvents }>;

// What `server.define` may hand the room: tests swap YouTube's titles for their own.
export interface CinemaRoomOptions {
  lookupTitle?: TitleLookup;
}

const { room } = limits;

// Intents that change nothing anyone sees: nothing to send afterwards.
const quietIntents: ReadonlySet<CinemaIntentType> = new Set(['sync', 'ping', 'react']);

// Refusals that happen in normal use: a fast hand, a move that crossed someone else's.
const expectedRefusals: ReadonlySet<CinemaErrorCode> = new Set(['RATE_LIMITED', 'NOTHING_PLAYING', 'NO_SUCH_ITEM', 'TOO_SOON', 'COLOR_TAKEN', 'NOT_A_LINK', 'NOT_HTTPS', 'UNSUPPORTED_LINK']);

// 12 characters of [0-9a-z]: about 62 bits, so room links can't be guessed.
const createRoomId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

const joinError = (code: CinemaErrorCode): ServerError => new ServerError(ErrorCode.APPLICATION_ERROR, code);

// A join with bad options, or from a web app on another protocol version, is turned away.
const readJoinOptions = (options: unknown): CinemaJoinOptions => {
  const result = v.safeParse(cinemaJoinOptionsSchema, options);

  if (!result.success) throw joinError('INVALID_JOIN');

  if (result.output.protocolVersion !== cinemaProtocolVersion) throw joinError('PROTOCOL_MISMATCH');

  return result.output;
};

// One room. Its parts own the rules: who is here (members), the cinema (the engine's queue, players and
// playback, on the room's clock), the feed, what each browser is sent, rate limits, and when the empty
// room is thrown away. This class only wires them to Colyseus.
export class CinemaRoom extends Room<{ client: CinemaClient }> {
  override maxClients = room.maxClients;
  // The lifecycle decides when an empty room goes, not Colyseus.
  override autoDispose = false;
  override maxMessagesPerSecond = room.maxMessagesPerSecond;
  readonly #schedule: Schedule = (callback, delayMs) => {
    const delayed = this.clock.setTimeout(callback, delayMs);

    return () => delayed.clear();
  };

  readonly #members = new CinemaRoomMembers(Math.random);
  readonly #feed = new CinemaRoomFeed({ now: Date.now, createId: randomUUID, maxItems: feedMaxItems });
  readonly #rateLimits = new CinemaRoomRateLimits(room.rates, Date.now);
  readonly #cinema = new Cinema({ createId: randomUUID, nameOf: (id) => this.#members.find(id)?.name ?? '' });
  readonly #handlers: CinemaRoomHandlers = this.#createHandlers();

  readonly #outbox = new CinemaRoomOutbox({
    feed: this.#feed,
    view: () => cinemaView({ members: this.#members.all, cinema: this.#cinema, now: Date.now() }),
    now: Date.now,
    send: (memberId, type, message) => this.clients.getById(memberId)?.send(type, message),
  });

  readonly #lifecycle = new CinemaRoomLifecycle({ schedule: this.#schedule, graceMs: room.emptyGraceMs, close: () => void this.disconnect() });
  #lookupTitle: TitleLookup = fetchYoutubeTitle;

  override onCreate(options: CinemaRoomOptions): void {
    this.roomId = createRoomId();

    if (typeof options.lookupTitle === 'function') this.#lookupTitle = options.lookupTitle;

    this.#listen();
    this.#lifecycle.open();
    this.clock.setInterval(() => this.#tick(), room.tickMs);
    logger.info('room created', { roomId: this.roomId });
  }

  override onJoin(client: CinemaClient, options: unknown): void {
    const { name, entered } = readJoinOptions(options);
    const member = this.#members.join(client.sessionId, name);

    this.#cinema.join(member.id, entered, Date.now());
    this.#lifecycle.join();
    this.#feed.system(member, { type: 'joined' });
    this.#changed();
    logger.info('room joined', { roomId: this.roomId, sessionId: client.sessionId, people: this.#members.count });
  }

  // A lost connection keeps its seat for a while; the browser reconnects on its own and asks for
  // everything again with `sync`.
  override onDrop(client: CinemaClient): void {
    this.#members.drop(client.sessionId);
    this.#cinema.connect(client.sessionId, false, Date.now());
    this.#outbox.forget(client.sessionId);
    this.#changed();
    this.allowReconnection(client, room.reconnectSeconds);
  }

  override onReconnect(client: CinemaClient): void {
    this.#members.reconnect(client.sessionId);
    this.#cinema.connect(client.sessionId, true, Date.now());
    this.#changed();
  }

  override onLeave(client: CinemaClient): void {
    if (!this.#members.has(client.sessionId)) return;

    const member = this.#members.leave(client.sessionId);

    this.#cinema.leave(member.id, Date.now());
    this.#rateLimits.forget(member.id);
    this.#outbox.forget(member.id);
    this.#feed.system(member, { type: 'left' });
    this.#lifecycle.leave(this.#members.count);
    this.#changed();
    logger.info('room left', { roomId: this.roomId, sessionId: client.sessionId, people: this.#members.count });
  }

  override onDispose(): void {
    this.#lifecycle.dispose();
    this.#rateLimits.dispose();
    this.#outbox.dispose();
    logger.info('room closed', { roomId: this.roomId });
  }

  #createHandlers(): CinemaRoomHandlers {
    const now = Date.now;

    return cinemaRoomHandlers({
      cinema: this.#cinema,
      now,
      sync: (id) => this.#outbox.sync(id),
      pong: (id, sentAt) => this.clients.getById(id)?.send('pong', { sentAt, serverNow: now() }),
      enter: (id, name, color) => this.#enter(id, name, color),
      rename: (id, name) => this.#rename(id, name),
      recolor: (id, color) => this.#members.recolor(id, color),
      chat: (id, text) => this.#feed.message(this.#members.get(id), text),
      react: (id, emoji) => this.broadcast('reaction', { memberId: id, emoji }, { except: this.clients.getById(id) }),
      add: (id, url) => this.#add(id, url),
      replay: (id, itemId) => this.#cinema.replay(this.#author(id), itemId, now()),
      failed: (id, itemId, code) => this.#cinema.failed(id, itemId, code, now()),
    });
  }

  #listen(): void {
    (Object.keys(cinemaIntentSchemas) as CinemaIntentType[]).forEach((type) => this.#on(type));
  }

  // Past the join card, with the name and colour picked there. A colour someone took a moment
  // before is refused, and they pick again.
  #enter(id: string, name: string, color: ViewerColor): void {
    this.#members.recolor(id, color);
    this.#rename(id, name);
    this.#cinema.enter(id, Date.now());
  }

  // The line keeps the old name: "Anna is now Anna K".
  #rename(id: string, text: string): void {
    const name = this.#members.cleanName(id, text);

    if (name === null) return;

    this.#feed.system(this.#members.get(id), { type: 'renamed', name });
    this.#members.rename(id, name);
  }

  // A pasted link is read here, never fetched (core-api rule 5). A YouTube video waits for its title
  // from YouTube first (a moment), so the queue and the feed line can name it.
  #add(id: string, url: string): void {
    const result = parseMediaLink(url);

    if (!result.ok) throw new CinemaRoomError(result.error);

    const { source } = result;

    if (source.kind !== 'youtube') return void this.#cinema.add(this.#author(id), source, result.title, Date.now());

    void this.#lookupTitle(source.ref).then((title) => this.#addLater(id, () => this.#cinema.add(this.#author(id), source, title, Date.now())));
  }

  // An add that finished after its message: refusals go back to the sender by hand.
  #addLater(id: string, add: () => void): void {
    const client = this.clients.getById(id);

    if (!client || !this.#members.has(id)) return;

    try {
      add();
    } catch (error) {
      if (!(error instanceof CinemaRuleError)) throw error;

      this.#refuse(client, 'add', error.code);
    }

    this.#changed();
  }

  #author(id: string): { id: string; name: string; color: ViewerColor } {
    const { name, color } = this.#members.get(id);

    return { id, name, color };
  }

  #tick(): void {
    this.#cinema.tick(Date.now());
    this.#changed();
  }

  // After every change: what the cinema noticed becomes feed lines, and everyone is sent what changed.
  #changed(): void {
    this.#cinema.drainNotices().forEach((notice) => this.#line(notice));
    this.#outbox.flush();
  }

  #line({ by, event }: CinemaNotice): void {
    const author = this.#members.find(by);

    if (author) this.#feed.system(author, event);
  }

  // Every handler: validate the message, check the sender's rate, then the one call, then send out
  // what changed. Anything refused goes back to the sender as an `error` event; nobody is
  // disconnected for it.
  #on<K extends CinemaIntentType>(type: K): void {
    this.onMessage(type, (client: CinemaClient, input: unknown) => {
      const result = v.safeParse(cinemaIntentSchemas[type], input);

      if (!result.success) return this.#refuse(client, type, 'INVALID_MESSAGE');

      if (!this.#rateLimits.allow(client.sessionId, type)) return this.#refuse(client, type, 'RATE_LIMITED');

      try {
        (this.#handlers[type] as (id: string, message: CinemaIntents[K]) => void)(client.sessionId, result.output as CinemaIntents[K]);
      } catch (error) {
        if (!(error instanceof CinemaRoomError) && !(error instanceof CinemaRuleError)) throw error;

        this.#refuse(client, type, error.code);
      }

      if (!quietIntents.has(type)) this.#changed();
    });
  }

  #refuse(client: CinemaClient, type: CinemaIntentType, code: CinemaErrorCode): void {
    if (!expectedRefusals.has(code)) logger.warn('room message refused', { roomId: this.roomId, sessionId: client.sessionId, type, code });

    client.send('error', { code, type });
  }
}
