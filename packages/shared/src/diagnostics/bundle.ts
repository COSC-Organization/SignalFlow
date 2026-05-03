import type { ParsedSDP } from '../types';
import type { DiagnosticIssue } from './index';

// ── Rule 17: bundle-missing ─────────────────────────────────────────

export function checkBundleMissing(
  sdp1: ParsedSDP,
  _sdp2: ParsedSDP,
): DiagnosticIssue | null {
  if (sdp1.media.length <= 1) return null;

  const hasBundleGroup = sdp1.groups.some(
    (g) => g.type.toUpperCase() === 'BUNDLE',
  );

  if (hasBundleGroup) return null;

  return {
    id: 'bundle-missing',
    severity: 'warning',
    category: 'BUNDLE',
    title: 'No BUNDLE group despite multiple media sections',
    explanation:
      'The offer has more than one media section but no a=group:BUNDLE line. ' +
      'Without BUNDLE, each media section will use a separate ICE transport, ' +
      'increasing resource usage and connection setup time.',
    fix: 'Add a=group:BUNDLE with all media section MIDs to multiplex media over a single transport.',
  };
}

// ── Rule 18: bundle-mid-mismatch ────────────────────────────────────

export function checkBundleMidMismatch(
  sdp1: ParsedSDP,
  _sdp2: ParsedSDP,
): DiagnosticIssue | null {
  const mediaMids = new Set(sdp1.media.map((m) => m.mid));

  for (const group of sdp1.groups) {
    if (group.type.toUpperCase() !== 'BUNDLE') continue;

    for (const mid of group.mids) {
      if (!mediaMids.has(mid)) {
        return {
          id: 'bundle-mid-mismatch',
          severity: 'error',
          category: 'BUNDLE',
          title: 'BUNDLE group references a non-existent MID',
          explanation:
            `The BUNDLE group references mid="${mid}" but no media section with that MID ` +
            `exists in the SDP. This inconsistency will cause the browser to reject the ` +
            `session description or silently drop the affected media.`,
          fix: `Either add a media section with mid=${mid} or remove "${mid}" from the BUNDLE group.`,
        };
      }
    }
  }
  return null;
}
