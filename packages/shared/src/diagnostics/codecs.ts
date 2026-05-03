import type { ParsedSDP, MediaSection } from '../types';
import type { DiagnosticIssue } from './index';

function videoSections(sdp: ParsedSDP): MediaSection[] {
  return sdp.media.filter((m) => m.type === 'video');
}

function codecNamesUpper(m: MediaSection): string[] {
  return m.codecs.map((c) => c.name.toUpperCase());
}

export function checkCodecNoCommonVideo(sdp1: ParsedSDP, sdp2: ParsedSDP): DiagnosticIssue | null {
  const v1 = videoSections(sdp1);
  const v2 = videoSections(sdp2);
  if (v1.length === 0 || v2.length === 0) return null;
  const names1 = new Set(v1.flatMap(codecNamesUpper));
  const names2 = new Set(v2.flatMap(codecNamesUpper));
  const common = [...names1].filter((n) => names2.has(n));
  if (common.length > 0) return null;
  return {
    id: 'codec-no-common-video', severity: 'error', category: 'Codecs',
    title: 'No common video codecs between offer and answer',
    explanation: 'The offer and answer both contain video sections but share zero codec names. Without a mutually supported codec the video track will fail.',
    fix: 'Ensure at least one common video codec (e.g. VP8, H.264) is offered and accepted by both sides.',
  };
}

export function checkCodecAv1NotNegotiated(sdp1: ParsedSDP, sdp2: ParsedSDP): DiagnosticIssue | null {
  const v1 = videoSections(sdp1);
  const v2 = videoSections(sdp2);
  if (v1.length === 0 || v2.length === 0) return null;
  const has1 = v1.some((m) => m.codecs.some((c) => c.name.toUpperCase() === 'AV1'));
  const has2 = v2.some((m) => m.codecs.some((c) => c.name.toUpperCase() === 'AV1'));
  if (!has1 || has2) return null;
  return {
    id: 'codec-av1-not-negotiated', severity: 'info', category: 'Codecs',
    title: 'AV1 offered but not accepted',
    explanation: 'The offer includes AV1 but the answer does not. AV1 provides superior compression but is not yet universally supported. The session will fall back to another codec.',
    fix: 'If AV1 is desired, ensure the remote peer supports AV1 decoding. Otherwise this is informational only.',
  };
}

export function checkCodecNoOpus(sdp1: ParsedSDP, sdp2: ParsedSDP): DiagnosticIssue | null {
  for (const m of sdp1.media.filter((s) => s.type === 'audio')) {
    if (m.codecs.length > 0 && !m.codecs.some((c) => c.name.toLowerCase() === 'opus')) {
      return {
        id: 'codec-no-opus', severity: 'warning', category: 'Codecs',
        title: 'No Opus codec in offer audio',
        explanation: `Offer audio mid=${m.mid} has codecs but no Opus. Opus is mandatory-to-implement in WebRTC and its absence may cause interoperability issues.`,
        fix: 'Add Opus (typically PT 111, 48000/2) to the audio codec list.', affectedMid: m.mid,
      };
    }
  }
  for (const m of sdp2.media.filter((s) => s.type === 'audio')) {
    if (m.codecs.length > 0 && !m.codecs.some((c) => c.name.toLowerCase() === 'opus')) {
      return {
        id: 'codec-no-opus', severity: 'warning', category: 'Codecs',
        title: 'No Opus codec in answer audio',
        explanation: `Answer audio mid=${m.mid} has codecs but no Opus. Opus is mandatory-to-implement in WebRTC and its absence may cause interoperability issues.`,
        fix: 'Add Opus (typically PT 111, 48000/2) to the audio codec list.', affectedMid: m.mid,
      };
    }
  }
  return null;
}

export function checkCodecMissingRtx(sdp1: ParsedSDP, _sdp2: ParsedSDP): DiagnosticIssue | null {
  const primaryNames = new Set(['VP8', 'VP9', 'H264', 'AV1']);
  for (const m of videoSections(sdp1)) {
    for (const c of m.codecs) {
      if (primaryNames.has(c.name.toUpperCase()) && c.rtx === undefined) {
        return {
          id: 'codec-missing-rtx', severity: 'warning', category: 'Codecs',
          title: `${c.name} codec missing RTX retransmission`,
          explanation: `Video codec ${c.name} (PT ${c.payloadType}) in mid=${m.mid} has no RTX. RTX enables retransmission of lost packets, improving quality on lossy networks.`,
          fix: `Add an RTX payload type mapped to ${c.name} via a=fmtp with apt=${c.payloadType}.`, affectedMid: m.mid,
        };
      }
    }
  }
  return null;
}

export function checkCodecOpusStereoMismatch(sdp1: ParsedSDP, sdp2: ParsedSDP): DiagnosticIssue | null {
  const findOpus = (sdp: ParsedSDP) => {
    for (const m of sdp.media.filter((s) => s.type === 'audio')) {
      const opus = m.codecs.find((c) => c.name.toLowerCase() === 'opus');
      if (opus) return opus;
    }
    return undefined;
  };
  const opus1 = findOpus(sdp1);
  const opus2 = findOpus(sdp2);
  if (!opus1 || !opus2) return null;
  const s1 = opus1.fmtp['stereo'] === '1';
  const s2 = opus2.fmtp['stereo'] === '1';
  if (s1 === s2) return null;
  return {
    id: 'codec-opus-stereo-mismatch', severity: 'info', category: 'Codecs',
    title: 'Opus stereo configuration mismatch',
    explanation: 'One SDP has Opus with stereo=1 while the other does not. Audio will still work, but the stereo experience may be degraded.',
    fix: 'Align the Opus fmtp stereo parameter on both sides if stereo audio is desired.',
  };
}
