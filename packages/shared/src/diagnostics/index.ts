import type { ParsedSDP } from '../types';
import {
  checkIceMissingCredentials,
  checkIceNoTurnCandidates,
  checkIceSameCredentials,
  checkIceOnlyHostCandidates,
  checkIceNoCandidatesAtAll,
} from './ice';
import {
  checkDtlsMissingFingerprint,
  checkDtlsSha1Fingerprint,
  checkDtlsRoleConflict,
} from './dtls';
import {
  checkCodecNoCommonVideo,
  checkCodecAv1NotNegotiated,
  checkCodecNoOpus,
  checkCodecMissingRtx,
  checkCodecOpusStereoMismatch,
} from './codecs';
import {
  checkSimulcastNotAccepted,
  checkSimulcastRidMismatch,
  checkSimulcastMissingRtx,
} from './simulcast';
import {
  checkBundleMissing,
  checkBundleMidMismatch,
} from './bundle';

// ── Types ───────────────────────────────────────────────────────────

export interface DiagnosticIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'ICE' | 'DTLS' | 'Codecs' | 'Simulcast' | 'BUNDLE' | 'General';
  title: string;
  explanation: string;
  fix: string;
  affectedMid?: string;
}

export type DiagnosticRule = (
  sdp1: ParsedSDP,
  sdp2: ParsedSDP,
) => DiagnosticIssue | null;

// ── All rules ───────────────────────────────────────────────────────

const allRules: DiagnosticRule[] = [
  // ICE
  checkIceMissingCredentials,
  checkIceNoTurnCandidates,
  checkIceSameCredentials,
  checkIceOnlyHostCandidates,
  checkIceNoCandidatesAtAll,
  // DTLS
  checkDtlsMissingFingerprint,
  checkDtlsSha1Fingerprint,
  checkDtlsRoleConflict,
  // Codecs
  checkCodecNoCommonVideo,
  checkCodecAv1NotNegotiated,
  checkCodecNoOpus,
  checkCodecMissingRtx,
  checkCodecOpusStereoMismatch,
  // Simulcast
  checkSimulcastNotAccepted,
  checkSimulcastRidMismatch,
  checkSimulcastMissingRtx,
  // BUNDLE
  checkBundleMissing,
  checkBundleMidMismatch,
];

// ── Public API ──────────────────────────────────────────────────────

/**
 * Run every diagnostic rule against a pair of SDPs and return all
 * issues found. Rules that return `null` are silently skipped.
 */
export function runDiagnostics(
  sdp1: ParsedSDP,
  sdp2: ParsedSDP,
): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];

  for (const rule of allRules) {
    const issue = rule(sdp1, sdp2);
    if (issue !== null) {
      issues.push(issue);
    }
  }

  return issues;
}

// Re-export sub-module types / functions for convenience
export * from './ice';
export * from './dtls';
export * from './codecs';
export * from './simulcast';
export * from './bundle';
