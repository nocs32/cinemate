import { Cinema, CinemaRuleError, parseMediaLink, type CinemaNotice } from '@cinemate/engine';
import { cleanPersonName, type CinemaErrorCode, type CinemaIntents, type CinemaIntentType, type CinemaSnapshot, type MemberSnapshot, type ViewerColor } from '@cinemate/protocol';
import type { CinemaLinkListeners, DemoAction } from '../types';
import { DemoFeed } from './feed';
import { demoTitles } from './films';
import { demoHandlers, type DemoHandlers } from './intents';
import { DemoSamples, demoProfiles } from './samples';
import type { DemoDeps, DemoMember } from './types';

const tickMs = 250;
const reportMs = 500;

// The room without a server (spec §12 M1): the engine's cinema in the browser, with sample viewers
// whose pretend players report like real ones. Every room is new, and a reload starts over.
export class DemoReferee {
  readonly #deps: DemoDeps;
  readonly #listeners: CinemaLinkListeners;
  readonly #members = new Map<string, DemoMember>();
  readonly #cinema: Cinema;
  readonly #feed: DemoFeed;
  readonly #samples: DemoSamples;
  readonly #handlers: DemoHandlers;
  readonly #stops: Array<() => void>;
  #sent = '';

  constructor(deps: DemoDeps, listeners: CinemaLinkListeners) {
    this.#deps = deps;
    this.#listeners = listeners;
    this.#cinema = new Cinema({ createId: deps.createId, nameOf: (id) => this.#members.get(id)?.name ?? '' });
    this.#feed = new DemoFeed(deps);
    this.#samples = new DemoSamples(deps);
    this.#handlers = this.#createHandlers();
    this.#stops = [deps.repeat(() => this.#tick(), tickMs), deps.repeat(() => this.#reportSamples(), reportMs)];
  }

  join(member: DemoMember, entered: boolean): void {
    this.#members.set(member.id, member);
    this.#cinema.join(member.id, entered, this.#deps.now());
    this.#feed.system(member, { type: 'joined' });

    if (member.sample) this.#samples.add(member.id);

    this.#flush();
  }

  // The next sample viewer from the cast, if one is free.
  addSample(): DemoMember | null {
    const taken = new Set([...this.#members.values()].map((member) => member.name));
    const profile = demoProfiles.find((candidate) => !taken.has(candidate.name));

    if (!profile) return null;

    const member: DemoMember = { id: this.#deps.createId(), ...profile, connected: true, sample: true };

    this.join(member, true);

    return member;
  }

  removeSample(): void {
    const id = this.#samples.ids.at(-1);
    const member = id ? this.#members.get(id) : undefined;

    if (!member) return;

    this.#samples.remove(member.id);
    this.#members.delete(member.id);
    this.#cinema.leave(member.id, this.#deps.now());
    this.#feed.system(member, { type: 'left' });
    this.#flush();
  }

  run(action: DemoAction): void {
    if (action === 'addViewer') this.addSample();
    else if (action === 'removeViewer') this.removeSample();
    else this.#cue(action);
  }

  // A sample viewer pastes a link, as a person would.
  paste(memberId: string, url: string): void {
    this.handle(memberId, 'add', { url });
  }

  handle<K extends CinemaIntentType>(memberId: string, type: K, message: CinemaIntents[K]): void {
    try {
      (this.#handlers[type] as (id: string, payload: CinemaIntents[K]) => void)(memberId, message);
    } catch (error) {
      if (!(error instanceof CinemaRuleError)) throw error;

      this.#refuse(type, error.code);
    }

    this.#flush();
  }

  dispose(): void {
    this.#stops.forEach((stop) => stop());
  }

  #createHandlers(): DemoHandlers {
    return demoHandlers({
      cinema: this.#cinema,
      now: this.#deps.now,
      sync: () => this.#flush(true),
      pong: (sentAt) => this.#listeners.pong({ sentAt, serverNow: this.#deps.now() }),
      enter: (id, name, color) => this.#enter(id, name, color),
      rename: (id, name) => this.#rename(id, name),
      recolor: (id, color) => this.#recolor(id, color),
      chat: (id, text) => this.#chat(id, text),
      add: (id, url) => this.#add(id, url),
      replay: (id, itemId) => this.#cinema.replay(this.#author(id), itemId, this.#deps.now()),
      report: (id, report) => this.#cinema.report(id, report, this.#deps.now()),
      failed: (id, itemId, code) => this.#cinema.failed(id, itemId, code, this.#deps.now()),
    });
  }

  #enter(id: string, name: string, color: ViewerColor): void {
    this.#rename(id, name);
    this.#recolor(id, color);
    this.#cinema.enter(id, this.#deps.now());
  }

  #rename(id: string, text: string): void {
    const member = this.#members.get(id);
    const name = cleanPersonName(text);

    if (!member || !name) throw new CinemaRuleError('EMPTY_NAME');

    if (name === member.name) return;

    member.name = name;
    this.#feed.system(member, { type: 'renamed', name });
  }

  #recolor(id: string, color: ViewerColor): void {
    const member = this.#members.get(id);

    if ([...this.#members.values()].some((other) => other.id !== id && other.color === color)) throw new CinemaRuleError('COLOR_TAKEN');

    if (member) member.color = color;
  }

  #chat(id: string, text: string): void {
    const member = this.#members.get(id);
    const clean = text.trim();

    if (member && clean) this.#feed.message(member, clean);
  }

  #add(id: string, url: string): void {
    const result = parseMediaLink(url);

    if (!result.ok) throw new CinemaRuleError(result.error);

    const title = result.source.kind === 'youtube' ? (demoTitles[result.source.ref] ?? null) : result.title;

    this.#cinema.add(this.#author(id), result.source, title, this.#deps.now());
  }

  #author(id: string): { id: string; name: string; color: ViewerColor } {
    const member = this.#members.get(id);

    return { id, name: member?.name ?? '', color: member?.color ?? 'teal' };
  }

  #cue(action: DemoAction): void {
    const cued = this.#samples.cue(action);

    if (!cued) return;

    this.#deps.schedule(() => {
      this.#chat(cued.id, cued.line);
      this.#flush();
    }, 2500);
  }

  #refuse(type: CinemaIntentType, code: CinemaErrorCode): void {
    this.#listeners.refused({ type, code });
  }

  #tick(): void {
    this.#cinema.tick(this.#deps.now());
    this.#flush();
  }

  #reportSamples(): void {
    this.#samples.reportAll(this.#cinema);
    this.#flush();
  }

  #lineFor(notice: CinemaNotice): void {
    const member = this.#members.get(notice.by);

    if (member) this.#feed.system(member, notice.event);
  }

  // Sends the room when it changed, as the server's outbox does.
  #flush(force = false): void {
    this.#cinema.drainNotices().forEach((notice) => this.#lineFor(notice));

    const snapshot = this.#snapshot();
    const text = JSON.stringify(snapshot);

    if (!force && text === this.#sent) return;

    this.#sent = text;
    this.#listeners.snapshot(snapshot);
  }

  #snapshot(): CinemaSnapshot {
    const now = this.#deps.now();

    const members = [...this.#members.values()].map((member): MemberSnapshot => {
      const state = this.#cinema.member(member.id, now);

      return { id: member.id, name: member.name, color: member.color, connected: member.connected, entered: state?.entered ?? false, status: state?.status ?? 'joining', offsetMs: state?.offsetMs ?? null, slowpokes: state?.slowpokes ?? 0 };
    });

    return { members, ...this.#cinema.view(), feed: this.#feed.items };
  }
}
