import type { ParsedSDP, MediaSection, Codec } from '../types';

// ── Types ───────────────────────────────────────────────────────────

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffItem {
  path: string;
  label: string;
  type: DiffType;
  valueBefore?: string;
  valueAfter?: string;
  severity: 'error' | 'warning' | 'info' | 'ok';
}

export interface MediaDiffSection {
  mid: string;
  type: string;
  items: DiffItem[];
}

export interface SDPDiffResult {
  items: DiffItem[];
  summary: {
    errors: number;
    warnings: number;
    changes: number;
    additions: number;
    removals: number;
  };
  mediaChanges: MediaDiffSection[];
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Compare two values and push a DiffItem if they differ.
 * Does nothing when both values are identical.
 */
function diffValue(
  items: DiffItem[],
  path: string,
  label: string,
  v1: string | undefined,
  v2: string | undefined,
  severity: DiffItem['severity'],
): void {
  if (v1 === v2) return;

  if (!v1 && v2) {
    items.push({ path, label, type: 'added', valueAfter: v2, severity });
  } else if (v1 && !v2) {
    items.push({ path, label, type: 'removed', valueBefore: v1, severity });
  } else {
    items.push({ path, label, type: 'changed', valueBefore: v1, valueAfter: v2, severity });
  }
}

/**
 * Get a sorted, unique, comma-joined string of candidate types from a
 * media section (e.g. "host,relay,srflx").
 */
function candidateTypesString(m: MediaSection): string {
  const types = new Set(m.candidates.map((c) => c.type));
  return [...types].sort().join(',');
}

/**
 * Get sorted uppercase codec names (e.g. "OPUS,VP8,VP9").
 */
function codecNames(m: MediaSection): string[] {
  return m.codecs.map((c) => c.name.toUpperCase()).sort();
}

/**
 * Get sorted RID ids as a comma-joined string.
 */
function ridString(m: MediaSection): string {
  if (!m.rid || m.rid.length === 0) return '';
  return m.rid.map((r) => r.id).sort().join(',');
}

// ── Media-section diff ──────────────────────────────────────────────

function diffMediaSection(
  m1: MediaSection,
  m2: MediaSection,
): MediaDiffSection {
  const items: DiffItem[] = [];
  const mid = m1.mid;
  const prefix = `media[${mid}]`;

  // Direction
  diffValue(items, `${prefix}.direction`, 'Direction', m1.direction, m2.direction, 'warning');

  // ICE ufrag presence
  diffValue(
    items,
    `${prefix}.iceUfrag`,
    'ICE ufrag',
    m1.iceUfrag || undefined,
    m2.iceUfrag || undefined,
    'info',
  );

  // ICE pwd presence
  diffValue(
    items,
    `${prefix}.icePwd`,
    'ICE password',
    m1.icePwd || undefined,
    m2.icePwd || undefined,
    'info',
  );

  // Fingerprint type
  diffValue(
    items,
    `${prefix}.fingerprint.type`,
    'Fingerprint type',
    m1.fingerprint.type || undefined,
    m2.fingerprint.type || undefined,
    'info',
  );

  // rtcpMux
  diffValue(
    items,
    `${prefix}.rtcpMux`,
    'RTCP-Mux',
    String(m1.rtcpMux),
    String(m2.rtcpMux),
    'warning',
  );

  // Candidate types
  const cand1 = candidateTypesString(m1);
  const cand2 = candidateTypesString(m2);
  diffValue(items, `${prefix}.candidates`, 'Candidate types', cand1 || undefined, cand2 || undefined, 'info');

  // Codecs — detect added/removed by name
  const names1 = codecNames(m1);
  const names2 = codecNames(m2);

  const addedCodecs = names2.filter((n) => !names1.includes(n));
  const removedCodecs = names1.filter((n) => !names2.includes(n));

  for (const name of addedCodecs) {
    items.push({
      path: `${prefix}.codecs`,
      label: `Codec ${name}`,
      type: 'added',
      valueAfter: name,
      severity: 'info',
    });
  }
  for (const name of removedCodecs) {
    items.push({
      path: `${prefix}.codecs`,
      label: `Codec ${name}`,
      type: 'removed',
      valueBefore: name,
      severity: 'warning',
    });
  }

  // Simulcast RID values
  const rid1 = ridString(m1);
  const rid2 = ridString(m2);
  diffValue(items, `${prefix}.simulcast.rid`, 'Simulcast RIDs', rid1 || undefined, rid2 || undefined, 'info');

  return { mid, type: m1.type, items };
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Produce a semantic diff between two parsed SDP objects.
 */
export function diffSDPs(sdp1: ParsedSDP, sdp2: ParsedSDP): SDPDiffResult {
  const items: DiffItem[] = [];
  const mediaChanges: MediaDiffSection[] = [];

  // ── Session-level diffs ─────────────────────────────────────────

  // Fingerprint
  const fp1 = sdp1.fingerprint.hash;
  const fp2 = sdp2.fingerprint.hash;
  diffValue(items, 'fingerprint', 'Session fingerprint', fp1 || undefined, fp2 || undefined, 'info');

  // BUNDLE groups
  const bundle1 = sdp1.groups.map((g) => `${g.type}:${g.mids.join(' ')}`).join('; ');
  const bundle2 = sdp2.groups.map((g) => `${g.type}:${g.mids.join(' ')}`).join('; ');
  diffValue(items, 'groups', 'BUNDLE groups', bundle1 || undefined, bundle2 || undefined, 'warning');

  // ── Media-section diffs ─────────────────────────────────────────

  const mids1 = new Map<string, MediaSection>();
  const mids2 = new Map<string, MediaSection>();
  for (const m of sdp1.media) mids1.set(m.mid, m);
  for (const m of sdp2.media) mids2.set(m.mid, m);

  // Removed media sections
  for (const [mid, m] of mids1) {
    if (!mids2.has(mid)) {
      items.push({
        path: `media[${mid}]`,
        label: `Media section m=${m.type} (mid=${mid})`,
        type: 'removed',
        valueBefore: m.type,
        severity: 'warning',
      });
    }
  }

  // Added media sections
  for (const [mid, m] of mids2) {
    if (!mids1.has(mid)) {
      items.push({
        path: `media[${mid}]`,
        label: `Media section m=${m.type} (mid=${mid})`,
        type: 'added',
        valueAfter: m.type,
        severity: 'info',
      });
    }
  }

  // Matched media sections — deep diff
  for (const [mid, m1] of mids1) {
    const m2 = mids2.get(mid);
    if (!m2) continue;

    const section = diffMediaSection(m1, m2);
    if (section.items.length > 0) {
      mediaChanges.push(section);
      items.push(...section.items);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────

  const summary = {
    errors: items.filter((i) => i.severity === 'error').length,
    warnings: items.filter((i) => i.severity === 'warning').length,
    changes: items.filter((i) => i.type === 'changed').length,
    additions: items.filter((i) => i.type === 'added').length,
    removals: items.filter((i) => i.type === 'removed').length,
  };

  return { items, summary, mediaChanges };
}
