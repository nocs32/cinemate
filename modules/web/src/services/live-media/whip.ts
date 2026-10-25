// WHIP and WHEP (spec §14.2): one offer with every candidate in it, one POST, one answer. The relay's
// Location header names the session, for hanging up.

const gatherMs = 3000;

export interface WhipOptions {
  // The publish key, for WHIP.
  token?: string;
  mungeOffer?: (sdp: string) => string;
  mungeAnswer?: (sdp: string) => string;
}

// Thrown when the relay says no: `status` 404 means the stream isn't there (yet).
export class WhipError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`The relay answered ${status}`);
    this.name = 'WhipError';
    this.status = status;
  }
}

const gathered = (pc: RTCPeerConnection): Promise<void> =>
  new Promise((done) => {
    if (pc.iceGatheringState === 'complete') return done();

    pc.addEventListener('icegatheringstatechange', () => {
      if (pc.iceGatheringState === 'complete') done();
    });

    setTimeout(done, gatherMs);
  });

// Returns the session's address on the relay.
export const negotiate = async (pc: RTCPeerConnection, url: string, options: WhipOptions = {}): Promise<string | null> => {
  const { token, mungeOffer = (sdp: string): string => sdp, mungeAnswer = (sdp: string): string => sdp } = options;
  const offer = await pc.createOffer();

  await pc.setLocalDescription({ type: 'offer', sdp: mungeOffer(offer.sdp ?? '') });
  await gathered(pc);

  const headers: Record<string, string> = { 'Content-Type': 'application/sdp' };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { method: 'POST', headers, body: pc.localDescription?.sdp ?? '' });

  if (!response.ok) throw new WhipError(response.status);

  await pc.setRemoteDescription({ type: 'answer', sdp: mungeAnswer(await response.text()) });

  const location = response.headers.get('Location');

  return location ? new URL(location, url).href : null;
};

// Tells the relay the session is over, so it doesn't wait for it to time out.
export const hangUp = (session: string | null): void => {
  if (session) void fetch(session, { method: 'DELETE' }).catch(() => undefined);
};
