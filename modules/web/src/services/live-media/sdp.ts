import { liveLimits } from '@cinemate/protocol';

const lineBreak = '\r\n';

// Opus in stereo at full bitrate, not Chrome's mono voice default.
export const stereoOpus = (sdp: string): string =>
  sdp.replace(/a=fmtp:(\d+) (.*useinbandfec=1.*)/u, (_line, pt: string, rest: string) => `a=fmtp:${pt} ${rest};stereo=1;sprop-stereo=1;maxaveragebitrate=${liveLimits.audioBitrate}`);

// Chrome's own bandwidth guess stalls near zero on a fresh connection to the relay, and it shrinks the
// picture to fit (the spike's 144p). The relay's answer gets Chrome's floor, start and ceiling, in kbps,
// on every video codec, so it sends at full quality from the first second.
export const bitrateFloor =
  (mbps: number): ((sdp: string) => string) =>
  (sdp: string): string => {
    const kbps = mbps * 1000;
    const extra = `x-google-min-bitrate=${Math.round(kbps * liveLimits.floorShare)};x-google-start-bitrate=${Math.round(kbps * liveLimits.startShare)};x-google-max-bitrate=${kbps}`;
    const [head = '', ...sections] = sdp.split(new RegExp(`${lineBreak}(?=m=)`, 'u'));

    const video = (section: string): string =>
      section
        .split(lineBreak)
        .flatMap((line) => {
          if (/^a=fmtp:\d+ (?!apt=)/u.test(line)) return [`${line};${extra}`];

          const rtpmap = /^a=rtpmap:(\d+) (?!rtx)/u.exec(line);

          return rtpmap && !section.includes(`a=fmtp:${rtpmap[1]} `) ? [line, `a=fmtp:${rtpmap[1]} ${extra}`] : [line];
        })
        .join(lineBreak);

    return [head, ...sections.map((section) => (section.startsWith('m=video') ? video(section) : section))].join(lineBreak);
  };
