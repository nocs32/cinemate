import { Popover } from '@ark-ui/react/popover';
import { Tabs } from '@ark-ui/react/tabs';
import { styled } from 'styled-system/jsx';
import { viewerTones } from '../../../ui';

export const RoomSideRoot = styled(Tabs.Root, {
  base: { bg: 'bg.panel', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', minHeight: '0', minWidth: '0', transition: 'opacity 0.6s ease' },
  variants: {
    dimmed: { true: { opacity: '0.28' } },
  },
});

export const RoomSideTabs = styled(Tabs.List, {
  base: { display: 'flex', gap: '4px', padding: '14px 14px 0', borderBottom: '1px solid', borderColor: 'border.rule' },
  variants: {
    compact: { true: { padding: '4px 6px 0', gap: '0', '& button': { padding: '6px 8px 8px', fontSize: '13px' } } },
  },
});

export const RoomSideTab = styled(Tabs.Trigger, {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '0',
    bg: 'transparent',
    padding: '8px 12px 12px',
    marginBottom: '-1px',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '600',
    color: 'fg.muted',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    _selected: { color: 'fg.default', borderBottomColor: 'accent.default' },
  },
});

export const RoomSideCount = styled('span', {
  base: { fontSize: '12px', fontWeight: '500', color: 'fg.subtle' },
});

export const RoomSideBadge = styled('span', {
  base: { minWidth: '18px', height: '18px', paddingInline: '5px', borderRadius: 'full', bg: 'accent.default', color: 'accent.ink', fontSize: '11px', fontWeight: '700', display: 'grid', placeItems: 'center' },
});

export const RoomSidePanel = styled(Tabs.Content, {
  base: { minHeight: '0', display: 'flex', flexDirection: 'column', _hidden: { display: 'none' } },
});

export const RoomSideScroll = styled('div', {
  base: { flex: '1', minHeight: '0', overflowY: 'auto', padding: '14px' },
  variants: {
    compact: { true: { padding: '8px' } },
  },
});

export const RoomSideNote = styled('p', {
  base: { margin: '0 0 12px', fontSize: '13px', color: 'fg.subtle' },
});

export const RoomSideEmpty = styled('p', {
  base: { margin: '0', fontSize: '14px', color: 'fg.subtle', maxWidth: '36ch' },
});

export const RoomSideList = styled('ol', {
  base: { listStyle: 'none', margin: '0', padding: '0', display: 'grid', gap: '8px' },
});

// A ticket: the notches top and bottom mark where its stub would tear off.
export const RoomSideTicketRoot = styled('li', {
  base: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '30px 96px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '10px',
    bg: 'bg.raised',
    padding: '8px 6px 8px 0',
    borderRadius: 'ticket',
    mask: 'radial-gradient(circle 7px at 30px 0, transparent 98%, black) top / 100% 51% no-repeat, radial-gradient(circle 7px at 30px 100%, transparent 98%, black) bottom / 100% 51% no-repeat',
    transition: 'opacity 0.15s ease',
  },
  variants: {
    next: { true: { bg: 'bg.raisedHigh', '& > span:first-child': { color: 'accent.default' } } },
    // The video on screen: lit by the lamp along its edge.
    now: { true: { bg: 'bg.raisedHigh', boxShadow: 'inset 3px 0 0 {colors.accent.default}', '& > span:first-child': { color: 'accent.default', fontSize: '10px', letterSpacing: '0' } } },
    dragged: { true: { opacity: '0.4' } },
    played: { true: { opacity: '0.75', _hover: { opacity: '1' } } },
    compact: { true: { gridTemplateColumns: '24px 64px minmax(0, 1fr) auto', gap: '8px', padding: '6px 2px 6px 0', mask: 'radial-gradient(circle 6px at 24px 0, transparent 98%, black) top / 100% 51% no-repeat, radial-gradient(circle 6px at 24px 100%, transparent 98%, black) bottom / 100% 51% no-repeat' } },
  },
  compoundVariants: [{ next: false, played: false, now: false, css: { cursor: 'grab' } }],
});

export const RoomSideTicketPosition = styled('span', {
  base: { alignSelf: 'stretch', display: 'grid', placeItems: 'center', borderRight: '1px dashed', borderColor: 'border.seam', fontFamily: 'display', fontWeight: '700', fontSize: '13px', color: 'fg.muted' },
});

export const RoomSideTicketThumb = styled('span', {
  base: {
    width: '96px',
    aspectRatio: '16 / 9',
    borderRadius: '4px',
    overflow: 'hidden',
    bg: 'bg.panel',
    display: 'grid',
    placeItems: 'center',
    color: 'fg.subtle',
    '& img': { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    '& svg': { width: '22px', height: '22px' },
  },
  variants: {
    compact: { true: { width: '64px' } },
  },
});

export const RoomSideTicketInfo = styled('div', {
  base: { minWidth: '0' },
});

export const RoomSideTicketTitle = styled('div', {
  base: { fontSize: '13px', fontWeight: '600', lineHeight: '1.3', lineClamp: '2' },
});

export const RoomSideTicketMeta = styled('div', {
  base: { marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'fg.subtle', minWidth: '0' },
  variants: {
    compact: { true: { display: 'none' } },
  },
});

export const RoomSideTicketBy = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&::before': { content: '""', width: '8px', height: '8px', borderRadius: 'full', bg: 'var(--tone)', flex: 'none' },
  },
  variants: { tone: viewerTones },
});

export const RoomSideTicketAction = styled('button', {
  base: {
    width: '28px',
    height: '28px',
    display: 'grid',
    placeItems: 'center',
    border: '0',
    borderRadius: '7px',
    bg: 'transparent',
    color: 'fg.subtle',
    cursor: 'pointer',
    _hover: { bg: 'bg.panel', color: 'fg.default' },
    '& svg': { width: '15px', height: '15px' },
  },
  variants: {
    // Played tickets: the whole ticket is the button.
    cover: { true: { '&::after': { content: '""', position: 'absolute', inset: '0' } } },
  },
});

// "Remove the video playing now?"
export const RoomSideTicketRemoveNowContent = styled(Popover.Content, {
  base: { width: '260px', bg: 'bg.panel', borderRadius: 'control', padding: '14px', boxShadow: 'floating', outline: '0', zIndex: '30', display: 'grid', gap: '8px', animation: 'dialogIn 0.15s ease' },
});

export const RoomSideTicketRemoveNowTitle = styled('p', {
  base: { margin: '0', fontWeight: '600', fontSize: '14px' },
});

export const RoomSideTicketRemoveNowText = styled('p', {
  base: { margin: '0', fontSize: '13px', color: 'fg.muted' },
});

export const RoomSideTicketRemoveNowActions = styled('div', {
  base: { display: 'flex', gap: '8px', marginTop: '4px' },
});

export const RoomSideFeed = styled('div', {
  base: { flex: '1', minHeight: '0', overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
});

export const RoomSideChatLineMessage = styled('p', {
  base: { margin: '0', fontSize: '14px', overflowWrap: 'anywhere' },
});

export const RoomSideChatLineAuthor = styled('b', {
  base: { fontWeight: '600', marginRight: '6px', color: 'var(--tone)' },
  variants: { tone: viewerTones },
});

export const RoomSideChatLineSystem = styled('p', {
  base: { margin: '0', fontSize: '13px', color: 'fg.subtle' },
  variants: {
    warning: { true: { color: 'accent.default' } },
  },
});

// Under the queue: the box to paste a link into.
export const RoomSideFooter = styled('div', {
  base: { padding: '12px 14px 14px', borderTop: '1px solid', borderColor: 'border.rule' },
  variants: {
    compact: { true: { padding: '6px 8px 8px' } },
  },
});

export const RoomSideComposerNote = styled('p', {
  base: { margin: '0', padding: '0 14px 6px', fontSize: '12px', color: 'accent.default' },
});

export const RoomSideComposerRoot = styled('form', {
  base: { display: 'flex', gap: '8px', padding: '12px 14px 14px', borderTop: '1px solid', borderColor: 'border.rule' },
  variants: {
    compact: { true: { padding: '6px 8px 8px' } },
  },
});

export const RoomSideComposerInput = styled('input', {
  base: { flex: '1', minWidth: '0', height: '38px', bg: 'bg.raised', border: '0', borderRadius: '8px', paddingInline: '12px', outline: '0', _placeholder: { color: 'fg.subtle' }, _focusVisible: { boxShadow: '0 0 0 1px {colors.accent.default}' } },
});

export const RoomSideComposerReactions = styled('div', {
  base: { display: 'flex', gap: '2px' },
});

export const RoomSideComposerReact = styled('button', {
  base: { width: '34px', height: '38px', border: '0', borderRadius: '8px', bg: 'transparent', fontFamily: 'emoji', fontSize: '18px', cursor: 'pointer', _hover: { bg: 'bg.raised' } },
});
