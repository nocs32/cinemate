import type { ViewerColor } from '@cinemate/protocol';
import type { Schedule } from '../types';

export interface DemoDeps {
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
}

export interface DemoMember {
  id: string;
  name: string;
  color: ViewerColor;
  connected: boolean;
  // A sample viewer: stands in for a person in the demo room, with a pretend player.
  sample: boolean;
}

// How a sample viewer's pretend player behaves: fine, buffering, stuck on an ad, or a little behind.
export type DemoSampleMode = 'fine' | 'buffering' | 'ad' | 'lagging';
