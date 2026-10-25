// Everyone's colour in the room (spec D15): their seat, their name in the chat, the queue items they
// added. The server gives each newcomer a colour nobody has yet, and anyone can pick another free one.
export const viewerColors = ['teal', 'sky', 'coral', 'violet', 'pink', 'lime', 'orange', 'silver'] as const;

export type ViewerColor = (typeof viewerColors)[number];

export const isViewerColor = (value: string): value is ViewerColor => (viewerColors as readonly string[]).includes(value);

export const personNameMaxLength = 32;

// A name as the room keeps it: single spaces, no spaces at the ends, at most 32 characters.
// An empty result means the name is rejected.
export const cleanPersonName = (text: string): string => text.replace(/\s+/gu, ' ').trim().slice(0, personNameMaxLength).trim();
