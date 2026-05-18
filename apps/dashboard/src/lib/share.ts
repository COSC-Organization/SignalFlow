import { deflate, inflate } from 'pako';

/**
 * Compress and store an offer/answer SDP pair into the URL hash fragment.
 * This replaces the current hash in-place (no navigation).
 */
export function saveToHash(sdp1: string, sdp2: string): void {
  const payload = JSON.stringify({ sdp1, sdp2 });
  const compressed = deflate(payload);
  const base64 = btoa(String.fromCharCode(...compressed));
  window.history.replaceState(null, '', '#' + encodeURIComponent(base64));
}

/**
 * Read and decompress an SDP pair from the current URL hash fragment.
 * Returns `null` if the hash is empty or cannot be decoded.
 */
export function loadFromHash(): { sdp1: string; sdp2: string } | null {
  try {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return null;

    const binary = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
    const json = inflate(binary, { to: 'string' });
    return JSON.parse(json) as { sdp1: string; sdp2: string };
  } catch {
    return null;
  }
}

/**
 * Return the full shareable URL (including the hash fragment).
 */
export function generateShareURL(): string {
  return window.location.href;
}
