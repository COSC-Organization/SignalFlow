import type { ParsedSDP } from '../types';
import type { DiagnosticIssue } from './index';

// ── Rule 1: ice-missing-credentials ─────────────────────────────────

export function checkIceMissingCredentials(
  sdp1: ParsedSDP,
  _sdp2: ParsedSDP,
): DiagnosticIssue | null {
  for (const m of sdp1.media) {
    if (!m.iceUfrag || !m.icePwd) {
      return {
        id: 'ice-missing-credentials',
        severity: 'error',
        category: 'ICE',
        title: 'Missing ICE credentials',
        explanation:
          `Media section mid=${m.mid} is missing an ICE username fragment or password. ` +
          `Without valid ICE credentials the peer cannot authenticate connectivity checks. ` +
          `This will cause the ICE handshake to fail immediately.`,
        fix: 'Ensure both a=ice-ufrag and a=ice-pwd are present in every media section of the offer.',
        affectedMid: m.mid,
      };
    }
  }
  return null;
}

// ── Rule 2: ice-no-turn-candidates ──────────────────────────────────

export function checkIceNoTurnCandidates(
  sdp1: ParsedSDP,
  _sdp2: ParsedSDP,
): DiagnosticIssue | null {
  const allCandidates = sdp1.media.flatMap((m) => m.candidates);
  if (allCandidates.length === 0) return null;

  const hasRelay = allCandidates.some((c) => c.type === 'relay');
  if (hasRelay) return null;

  return {
    id: 'ice-no-turn-candidates',
    severity: 'warning',
    category: 'ICE',
    title: 'No TURN relay candidates',
    explanation:
      `The offer contains ICE candidates but none of them are TURN relay candidates. ` +
      `In restrictive network environments (corporate firewalls, symmetric NATs) a direct ` +
      `peer-to-peer connection may fail without a relay fallback.`,
    fix: 'Configure a TURN server in the ICE agent so relay candidates are gathered alongside host and server-reflexive candidates.',
  };
}

// ── Rule 3: ice-same-credentials ────────────────────────────────────

export function checkIceSameCredentials(
  sdp1: ParsedSDP,
  sdp2: ParsedSDP,
): DiagnosticIssue | null {
  for (const m1 of sdp1.media) {
    const m2 = sdp2.media.find((m) => m.mid === m1.mid);
    if (!m2) continue;

    if (m1.iceUfrag && m2.iceUfrag && m1.iceUfrag === m2.iceUfrag) {
      return {
        id: 'ice-same-credentials',
        severity: 'error',
        category: 'ICE',
        title: 'Identical ICE credentials on both sides',
        explanation:
          `Media section mid=${m1.mid} uses the same ice-ufrag in both the offer and the answer. ` +
          `Each peer must generate unique ICE credentials; reusing them indicates a copy-paste ` +
          `error or a srflx loopback misconfiguration.`,
        fix: 'Ensure each peer generates its own unique ICE username fragment and password during the offer/answer exchange.',
        affectedMid: m1.mid,
      };
    }
  }
  return null;
}

// ── Rule 4: ice-only-host-candidates ────────────────────────────────

export function checkIceOnlyHostCandidates(
  sdp1: ParsedSDP,
  _sdp2: ParsedSDP,
): DiagnosticIssue | null {
  const allCandidates = sdp1.media.flatMap((m) => m.candidates);
  if (allCandidates.length === 0) return null;

  const allHost = allCandidates.every((c) => c.type === 'host');
  if (!allHost) return null;

  return {
    id: 'ice-only-host-candidates',
    severity: 'warning',
    category: 'ICE',
    title: 'Only host candidates present',
    explanation:
      `Every ICE candidate in the offer is a host candidate. No server-reflexive (srflx) or ` +
      `relay candidates were gathered. This means connectivity will only succeed when both ` +
      `peers share the same local network.`,
    fix: 'Add a STUN server (for srflx candidates) and optionally a TURN server (for relay candidates) to the ICE configuration.',
  };
}

// ── Rule 5: ice-no-candidates-at-all ────────────────────────────────

export function checkIceNoCandidatesAtAll(
  sdp1: ParsedSDP,
  _sdp2: ParsedSDP,
): DiagnosticIssue | null {
  const totalCandidates = sdp1.media.reduce(
    (sum, m) => sum + m.candidates.length,
    0,
  );

  if (totalCandidates > 0) return null;

  return {
    id: 'ice-no-candidates-at-all',
    severity: 'error',
    category: 'ICE',
    title: 'No ICE candidates in the offer',
    explanation:
      `The offer SDP contains zero ICE candidates across all media sections. ` +
      `Without any candidates the ICE agent has no addresses to attempt connectivity ` +
      `checks on, and the connection will never be established.`,
    fix: 'Ensure ICE gathering completes before creating the offer, or use Trickle ICE to add candidates after the offer is sent.',
  };
}
