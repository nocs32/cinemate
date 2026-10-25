import { expect, test } from 'vitest';
import { CinemaRoomError } from './error.js';
import { CinemaRoomMembers } from './members.js';

test('newcomers get a free colour and their own name, or one the room makes up', () => {
  const members = new CinemaRoomMembers(() => 0);
  const anna = members.join('a', '  Anna  ');
  const other = members.join('b', null);

  expect(anna.name).toBe('Anna');
  expect(other.name).not.toBe('');
  expect(other.color).not.toBe(anna.color);
});

test('a colour someone else wears is refused; an empty name too', () => {
  const members = new CinemaRoomMembers(() => 0);
  const anna = members.join('a', 'Anna');

  members.join('b', 'Dima');

  expect(() => members.recolor('b', anna.color)).toThrow(CinemaRoomError);
  expect(() => members.cleanName('a', '   ')).toThrow(CinemaRoomError);
  expect(members.cleanName('a', 'Anna')).toBeNull();
  expect(members.cleanName('a', 'Anna  K')).toBe('Anna K');
});

test('a dropped connection keeps the seat until they leave', () => {
  const members = new CinemaRoomMembers(() => 0);

  members.join('a', 'Anna');
  members.drop('a');
  expect(members.get('a').connected).toBe(false);

  members.reconnect('a');
  expect(members.get('a').connected).toBe(true);

  members.leave('a');
  expect(members.has('a')).toBe(false);
  expect(() => members.leave('a')).toThrow(CinemaRoomError);
});
