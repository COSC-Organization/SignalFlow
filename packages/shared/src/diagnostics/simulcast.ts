import type { ParsedSDP, MediaSection } from '../types';
import type { DiagnosticIssue } from './index';

function videoSections(sdp: ParsedSDP): MediaSection[] {
  return sdp.media.filter((m) => m.type === 'video');
}

// ── Rule 14: simulcast-not-accepted ─────────────────────────────────

export function checkSimulcastNotAccepted(
  sdp1: ParsedSDP,
  sdp2: ParsedSDP,
): DiagnosticIssue | null {
  const v1 = videoSections(sdp1);
  const v2 = videoSections(sdp2);

  const offer1HasSimulcast = v1.some((m) => m.simulcast !== undefined);
  if (!offer1HasSimulcast) return null;

  const answer2HasSimulcast = v2.some((m) => m.simulcast !== undefined);
  if (answer2HasSimulcast) return null;

  return {
    id: 'simulcast-not-accepted',
    severity: 'warning',
    category: 'Simulcast',
    title: 'Simulcast offered but not accepted',
    explanation:
      'The offer includes a simulcast configuration on a video section but the answer ' +
      'does not include one. The remote peer either does not support simulcast or has ' +
      'chosen to reject it, so only a single video layer will be sent.',
    fix: 'Verify that the remote peer (SFU or browser) supports simulcast and is configured to accept it.',
  };
}

// ── Rule 15: simulcast-rid-mismatch ─────────────────────────────────

export function checkSimulcastRidMismatch(
  sdp1: ParsedSDP,
  sdp2: ParsedSDP,
): DiagnosticIssue | null {
  for (const v1 of videoSections(sdp1)) {
    if (!v1.rid || v1.rid.length === 0) continue;
    const v2 = videoSections(sdp2).find((m) => m.mid === v1.mid);
    if (!v2 || !v2.rid || v2.rid.length === 0) continue;

    const ids1 = v1.rid.map((r) => r.id).sort().join(',');
    const ids2 = v2.rid.map((r) => r.id).sort().join(',');

    if (ids1 !== ids2) {
      return {
        id: 'simulcast-rid-mismatch',
        severity: 'error',
        category: 'Simulcast',
        title: 'Simulcast RID mismatch between offer and answer',
        explanation:
          `Both SDPs have RID values in video mid=${v1.mid} but the sorted RID ids do not match ` +
          `(offer: ${ids1}, answer: ${ids2}). The peers disagree on which simulcast layers ` +
          `exist, which will prevent proper layer selection and switching.`,
        fix: 'Ensure both sides agree on the same set of RID identifiers for simulcast layers.',
        affectedMid: v1.mid,
      };
    }
  }
  return null;
}

// ── Rule 16: simulcast-missing-rtx ──────────────────────────────────

export function checkSimulcastMissingRtx(
  sdp1: ParsedSDP,
  _sdp2: ParsedSDP,
): DiagnosticIssue | null {
  const primaryNames = new Set(['VP8', 'VP9', 'H264', 'AV1']);

  for (const m of videoSections(sdp1)) {
    if (!m.simulcast) continue;

    const missingRtx = m.codecs.some(
      (c) => primaryNames.has(c.name.toUpperCase()) && c.rtx === undefined,
    );

    if (missingRtx) {
      return {
        id: 'simulcast-missing-rtx',
        severity: 'warning',
        category: 'Simulcast',
        title: 'Simulcast video codecs missing RTX',
        explanation:
          `Video section mid=${m.mid} uses simulcast but one or more primary codecs lack ` +
          `an RTX retransmission channel. Without RTX, packet loss on any simulcast layer ` +
          `cannot be recovered through retransmission, leading to visual artifacts.`,
        fix: 'Add RTX payload types for every primary video codec used in the simulcast configuration.',
        affectedMid: m.mid,
      };
    }
  }
  return null;
}
