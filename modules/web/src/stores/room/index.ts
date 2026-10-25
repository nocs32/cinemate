import type { CinemaErrorEvent, CinemaReactionEvent, CinemaSnapshot } from '@cinemate/protocol';
import { makeAutoObservable } from 'mobx';
import type { DemoAction, DemoControls, Services } from '../../services';
import type { LocaleStore, Translate } from '../locale';
import { RoomChatPaceStore } from './chat-pace';
import { RoomClockStore } from './clock';
import { RoomConnectionStore } from './connection';
import { RoomFeedStore } from './feed';
import { RoomJoinStore } from './join';
import { RoomLightsStore } from './lights';
import { RoomPasteStore } from './paste';
import { RoomPresenceStore } from './presence';
import { RoomQueueStore } from './queue';
import { RoomReactionsStore } from './reactions';
import { RoomScreenStore } from './screen';
import { RoomScreenControlsStore } from './screen/controls';
import { RoomScreenDriverStore } from './screen/driver';
import { RoomShareStore } from './share';
import { RoomSideStore } from './side';
import type { CinemaSend } from './types';

// The room sends; the room store hands it to its parts. Wrapped, because the room's actions are bound
// only once its constructor has run makeAutoObservable.
const createConnection = (room: RoomStore, services: Services, t: Translate): RoomConnectionStore =>
  new RoomConnectionStore({
    ...services,
    t,
    receivers: {
      snapshot: (snapshot) => room.receiveSnapshot(snapshot),
      pong: (event) => room.clock.receivePong(event),
      reaction: (event) => room.receiveReaction(event),
      refused: (event) => room.receiveRefusal(event),
    },
  });

// The room: its connection hands snapshots to the parts, and the parts send their intents back
// through it.
export class RoomStore {
  readonly connection: RoomConnectionStore;
  readonly presence: RoomPresenceStore;
  readonly clock: RoomClockStore;
  readonly queue: RoomQueueStore;
  readonly screen: RoomScreenStore;
  readonly driver: RoomScreenDriverStore;
  readonly controls: RoomScreenControlsStore;
  readonly lights: RoomLightsStore;
  readonly join: RoomJoinStore;
  readonly paste: RoomPasteStore;
  readonly screenPaste: RoomPasteStore;
  readonly feed: RoomFeedStore;
  readonly chatPace: RoomChatPaceStore;
  readonly reactions: RoomReactionsStore;
  readonly share: RoomShareStore;
  readonly side: RoomSideStore;
  #lastPaste: RoomPasteStore | null = null;

  constructor(services: Services, locale: LocaleStore) {
    const { t } = locale;
    const send: CinemaSend = (type, message) => this.connection.link?.send(type, message);
    const add = (url: string, owner: RoomPasteStore): void => this.add(url, owner);

    this.connection = createConnection(this, services, t);
    this.presence = new RoomPresenceStore({ t });
    this.clock = new RoomClockStore({ ...services, send });
    this.queue = new RoomQueueStore({ t, presence: this.presence, send });
    this.screen = new RoomScreenStore({ ...services, t, clock: this.clock, presence: this.presence, queue: this.queue, send });
    this.driver = new RoomScreenDriverStore({ ...services, screen: this.screen, clock: this.clock, send, isWatching: () => this.presence.me?.entered ?? false });
    this.controls = new RoomScreenControlsStore({ ...services, t, screen: this.screen, driver: this.driver, send });
    this.lights = new RoomLightsStore({ schedule: services.schedule, isPlaying: () => this.screen.playback.phase === 'playing' });
    this.join = new RoomJoinStore({ ...services, t, presence: this.presence, send, nowShowing: () => this.screen.title || null });
    this.paste = new RoomPasteStore({ t, schedule: services.schedule, add });
    this.screenPaste = new RoomPasteStore({ t, schedule: services.schedule, add });
    this.chatPace = new RoomChatPaceStore({ t, now: services.now, schedule: services.schedule });
    this.feed = new RoomFeedStore({ presence: this.presence, locale, send: (text) => send('chat', { text }), takeTurn: () => this.chatPace.take(), isOpen: () => this.side.isChatOpen });
    this.reactions = new RoomReactionsStore({ ...services, t, send: (emoji) => send('react', { emoji }) });
    this.share = new RoomShareStore({ ...services, roomId: () => this.connection.roomId, t });
    this.side = new RoomSideStore({ readChat: () => this.feed.markRead() });
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.connection.isOpen;
  }

  // Only the demo room has these.
  get demo(): DemoControls | null {
    return this.connection.link?.demo ?? null;
  }

  open(): void {
    this.connection.open();
    this.lights.start();
    this.controls.start();
  }

  runDemo(action: DemoAction): void {
    this.demo?.run(action);
  }

  receiveSnapshot(snapshot: CinemaSnapshot): void {
    this.clock.start();
    this.presence.receive(snapshot.members, this.connection.meId);
    this.queue.receive(snapshot.queue, snapshot.history);
    this.screen.receive(snapshot.playback);
    this.feed.receive(snapshot.feed);
  }

  receiveRefusal(event: CinemaErrorEvent): void {
    if (event.type === 'chat' && event.code === 'RATE_LIMITED') this.chatPace.refuse();

    if (event.type === 'add') this.#lastPaste?.refuse(event.code);

    if (event.type === 'enter') this.join.refuse();
  }

  receiveReaction(event: CinemaReactionEvent): void {
    this.reactions.receive(event.emoji, event.memberId, this.presence.find(event.memberId)?.name ?? '');
  }

  add(url: string, owner: RoomPasteStore): void {
    this.#lastPaste = owner;
    this.connection.link?.send('add', { url });
  }
}
