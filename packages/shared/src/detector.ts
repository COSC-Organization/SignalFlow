import type { ParsedSDP, SDPSource } from './types';

// ── Helper ──────────────────────────────────────────────────────────

/**
 * Returns true if ANY media section contains a codec with the given name
 * (case-insensitive).
 */
function hasCodec(sdp: ParsedSDP, name: string): boolean {
  const lower = name.toLowerCase();
  return sdp.media.some((m) =>
    m.codecs.some((c) => c.name.toLowerCase() === lower),
  );
}

/**
 * Returns true if the session-level OR any media-section fingerprint
 * matches the given type (case-insensitive).
 */
function hasFingerprintType(sdp: ParsedSDP, fpType: string): boolean {
  const lower = fpType.toLowerCase();
  if (sdp.fingerprint.type.toLowerCase() === lower) return true;
  return sdp.media.some(
    (m) => m.fingerprint.type.toLowerCase() === lower,
  );
}

// ── Detection Rules (order matters — first match wins) ──────────────

/**
 * Detect the browser or SFU that generated this SDP.
 *
 * Rules are evaluated top-to-bottom; the first match wins.
 */
export function detectSource(sdp: ParsedSDP): SDPSource {
  const rawLower = sdp.raw.toLowerCase();
  const username = sdp.origin.username;

  // ── SFU / SDK detection ───────────────────────────────────────────

  // LiveKit
  if (username === 'livekit' || rawLower.includes('livekit')) {
    return 'LiveKit';
  }

  // Daily.co
  if (username === 'daily' || rawLower.includes('daily.co')) {
    return 'Daily.co';
  }

  // mediasoup
  if (username === 'mediasoup' || rawLower.includes('mediasoup')) {
    return 'mediasoup';
  }

  // Pion
  if (username === 'pion' || rawLower.includes('pion-')) {
    return 'Pion';
  }

  // Janus
  if (username === 'janus' || rawLower.includes('janus')) {
    return 'Janus';
  }

  // ── Browser detection ─────────────────────────────────────────────

  const hasAV1 = hasCodec(sdp, 'AV1');

  // Firefox:
  //   origin address is 0.0.0.0, username is "-",
  //   extmapAllowMixed is false, and no AV1 codec
  if (
    sdp.origin.address === '0.0.0.0' &&
    username === '-' &&
    !sdp.extmapAllowMixed &&
    !hasAV1
  ) {
    return 'Firefox';
  }

  // Safari:
  //   fingerprint type sha-1 at any level,
  //   OR (no AV1 AND extmapAllowMixed false AND raw has no 'extmap-allow-mixed')
  if (hasFingerprintType(sdp, 'sha-1')) {
    return 'Safari';
  }
  if (!hasAV1 && !sdp.extmapAllowMixed && !rawLower.includes('extmap-allow-mixed')) {
    return 'Safari';
  }

  // Chrome:
  //   extmapAllowMixed is true,
  //   OR (fingerprint sha-256 AND has AV1)
  if (sdp.extmapAllowMixed) {
    return 'Chrome';
  }
  if (hasFingerprintType(sdp, 'sha-256') && hasAV1) {
    return 'Chrome';
  }

  return 'Unknown';
}
