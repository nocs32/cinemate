// What the demo room plays: Blender's free open movies (CC BY), on YouTube and as a file. The demo
// has no server to ask YouTube for titles, so it knows these.
export const demoTitles: Readonly<Record<string, string>> = {
  'aqz-KE-bpKQ': 'Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film',
  eRsGyueVLvQ: 'Sintel - Open Movie by Blender Foundation',
  R6MlUcmOul8: 'Tears of Steel - Blender VFX Open Movie',
  WhWc3b3KhnY: 'Spring - Blender Open Movie',
  mN0zPOpADL4: 'Agent 327: Operation Barbershop',
  PVGeM40dABA: 'Coffee Run - Blender Open Movie',
  UXqq0ZvbOnk: 'CHARGE - Blender Open Movie',
};

// The sample viewers fill the queue a moment after the room opens.
export const demoQueue: readonly string[] = [
  'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
  'https://download.blender.org/durian/trailer/sintel_trailer-1080p.mp4',
  'https://www.youtube.com/watch?v=R6MlUcmOul8',
  'https://www.youtube.com/watch?v=WhWc3b3KhnY',
  'https://youtu.be/mN0zPOpADL4',
  'https://www.youtube.com/watch?v=PVGeM40dABA',
];
