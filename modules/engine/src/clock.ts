// One ping to the server and back (spec §5.1): when it left, the server's time, and when it came back,
// the two ends by this browser's clock.
export interface ClockSample {
  sentAt: number;
  serverNow: number;
  receivedAt: number;
}

// How far the server's clock is ahead of this browser's, from the sample with the shortest round trip:
// the server read its clock about halfway through it. Null before the first sample.
export const clockOffset = (samples: readonly ClockSample[]): number | null => {
  const best = samples.reduce<ClockSample | null>((fastest, sample) => {
    if (sample.receivedAt < sample.sentAt) return fastest;

    return fastest === null || sample.receivedAt - sample.sentAt < fastest.receivedAt - fastest.sentAt ? sample : fastest;
  }, null);

  return best === null ? null : best.serverNow - (best.sentAt + best.receivedAt) / 2;
};
