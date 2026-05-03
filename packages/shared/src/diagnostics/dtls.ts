import type { ParsedSDP } from '../types';
import type { DiagnosticIssue } from './index';

// ── Rule 6: dtls-missing-fingerprint ────────────────────────────────

export function checkDtlsMissingFingerprint(
  sdp1: ParsedSDP,
  _sdp2: ParsedSDP,
): DiagnosticIssue | null {
  const hasSessionFp = sdp1.fingerprint.type !== '' && sdp1.fingerprint.hash !== '';

  for (const m of sdp1.media) {
    const hasMediaFp = m.fingerprint.type !== '' && m.fingerprint.hash !== '';
    if (!hasMediaFp && !hasSessionFp) {
      return {
        id: 'dtls-missing-fingerprint',
        severity: 'error',
        category: 'DTLS',
        title: 'Missing DTLS fingerprint',
        explanation:
          `Media section mid=${m.mid} has no DTLS fingerprint and there is no session-level ` +
          `fingerprint to inherit from. Without a fingerprint the DTLS handshake cannot ` +
          `verify the remote peer's certificate, making a secure connection impossible.`,
        fix: 'Add an a=fingerprint line with the certificate hash at the session level or in every media section.',
        affectedMid: m.mid,
      };
    }
  }
  return null;
}

// ── Rule 7: dtls-sha1-fingerprint ───────────────────────────────────

export function checkDtlsSha1Fingerprint(
  sdp1: ParsedSDP,
  sdp2: ParsedSDP,
): DiagnosticIssue | null {
  const allFingerprints = [
    sdp1.fingerprint,
    sdp2.fingerprint,
    ...sdp1.media.map((m) => m.fingerprint),
    ...sdp2.media.map((m) => m.fingerprint),
  ];

  const hasSha1 = allFingerprints.some(
    (fp) => fp.type.toLowerCase() === 'sha-1',
  );

  if (!hasSha1) return null;

  return {
    id: 'dtls-sha1-fingerprint',
    severity: 'warning',
    category: 'DTLS',
    title: 'SHA-1 fingerprint detected',
    explanation:
      `At least one SDP uses a SHA-1 fingerprint for DTLS certificate verification. ` +
      `SHA-1 is considered cryptographically weak and has been deprecated by most browsers. ` +
      `Some modern WebRTC implementations will reject SHA-1 fingerprints entirely.`,
    fix: 'Regenerate the DTLS certificate with SHA-256 and update the fingerprint in the SDP.',
  };
}

// ── Rule 8: dtls-role-conflict ──────────────────────────────────────

export function checkDtlsRoleConflict(
  sdp1: ParsedSDP,
  sdp2: ParsedSDP,
): DiagnosticIssue | null {
  // Check if all media sections in both SDPs have "a=setup:active"
  const activePattern = /a=setup:active/i;

  const sdp1AllActive =
    sdp1.media.length > 0 && activePattern.test(sdp1.raw);
  const sdp2AllActive =
    sdp2.media.length > 0 && activePattern.test(sdp2.raw);

  if (!sdp1AllActive || !sdp2AllActive) return null;

  // Verify it's truly on ALL media sections by checking occurrences vs media count
  // (a rough heuristic — if the raw contains setup:active and no setup:actpass or setup:passive
  //  then every section is active)
  const sdp1HasOtherRole = /a=setup:(actpass|passive)/i.test(sdp1.raw);
  const sdp2HasOtherRole = /a=setup:(actpass|passive)/i.test(sdp2.raw);

  if (sdp1HasOtherRole || sdp2HasOtherRole) return null;

  return {
    id: 'dtls-role-conflict',
    severity: 'error',
    category: 'DTLS',
    title: 'DTLS role conflict — both sides are active',
    explanation:
      `Both the offer and the answer specify a=setup:active for their DTLS role. ` +
      `In DTLS, one side must be the client (active) and the other the server (passive). ` +
      `When both sides try to initiate the handshake simultaneously, the connection fails.`,
    fix: 'The offerer should use a=setup:actpass and the answerer should choose a=setup:active or a=setup:passive.',
  };
}
