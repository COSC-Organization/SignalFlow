import * as sdpTransform from 'sdp-transform';
import type {
  ParsedSDP,
  MediaSection,
  Codec,
  IceCandidate,
  HeaderExtension,
  SSRC,
  Fingerprint,
  BundleGroup,
  SDPOrigin,
  SimulcastConfig,
  RidConfig,
  SctpConfig,
} from './types';
import { detectSource } from './detector';

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Normalize line endings to canonical SDP form (\r\n) and trim.
 */
function normalize(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n/g, '\r\n')
    .trim();
}

/**
 * Turn an sdp-transform `fmtp.config` string (e.g. "profile-level-id=42e01f;level-asymmetry-allowed=1")
 * into a Record<string, string> via sdpTransform.parseParams.
 */
function parseFmtpParams(config: string): Record<string, string> {
  const paramMap = sdpTransform.parseParams(config);
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(paramMap)) {
    result[key] = String(value);
  }
  return result;
}

// ── Media-section mappers ───────────────────────────────────────────

function buildCodecs(m: sdpTransform.MediaDescription): Codec[] {
  const codecs: Codec[] = [];

  // 1. Create a Codec for every RTP entry (skip RTX — we merge it later)
  for (const rtp of m.rtp ?? []) {
    codecs.push({
      payloadType: rtp.payload,
      name: rtp.codec,
      clockRate: rtp.rate ?? 0,
      channels: rtp.encoding,
      fmtp: {},
    });
  }

  // 2. Attach fmtp params to matching codec
  for (const f of m.fmtp ?? []) {
    const params = parseFmtpParams(f.config);
    const codec = codecs.find((c) => c.payloadType === f.payload);
    if (codec) {
      codec.fmtp = params;
    }
  }

  // 3. Detect RTX associations: codec named "rtx" whose fmtp contains "apt"
  const rtxCodecs = codecs.filter(
    (c) => c.name.toLowerCase() === 'rtx' && c.fmtp['apt'] !== undefined,
  );
  for (const rtx of rtxCodecs) {
    const associatedPt = parseInt(rtx.fmtp['apt'], 10);
    const primary = codecs.find((c) => c.payloadType === associatedPt);
    if (primary) {
      primary.rtx = rtx.payloadType;
    }
  }

  // Return only non-RTX codecs (RTX info is now on the primary codec)
  return codecs.filter((c) => c.name.toLowerCase() !== 'rtx');
}

function buildCandidates(m: sdpTransform.MediaDescription): IceCandidate[] {
  return (m.candidates ?? []).map((c) => ({
    foundation: c.foundation,
    component: c.component,
    transport: c.transport.toUpperCase() as 'UDP' | 'TCP',
    priority: c.priority,
    ip: c.ip,
    port: c.port,
    type: c.type as IceCandidate['type'],
    raddr: c.raddr,
    rport: c.rport,
  }));
}

function buildHeaderExtensions(m: sdpTransform.MediaDescription): HeaderExtension[] {
  return (m.ext ?? []).map((e) => ({
    value: e.value,
    uri: e.uri,
    direction: e.direction,
  }));
}

function buildSsrcs(m: sdpTransform.MediaDescription): SSRC[] {
  return (m.ssrcs ?? []).map((s) => ({
    id: s.id,
    attribute: s.attribute,
    value: s.value,
  }));
}

function buildSimulcast(m: sdpTransform.MediaDescription): SimulcastConfig | undefined {
  const sim = m.simulcast;
  if (!sim) return undefined;

  const config: SimulcastConfig = {};

  // dir1 / list1
  if (sim.dir1 === 'send') {
    config.send = sim.list1.split(';');
  } else if (sim.dir1 === 'recv') {
    config.recv = sim.list1.split(';');
  }

  // dir2 / list2
  if (sim.dir2 === 'send' && sim.list2) {
    config.send = sim.list2.split(';');
  } else if (sim.dir2 === 'recv' && sim.list2) {
    config.recv = sim.list2.split(';');
  }

  return config;
}

function buildRids(m: sdpTransform.MediaDescription): RidConfig[] | undefined {
  if (!m.rids || m.rids.length === 0) return undefined;

  return m.rids.map((r) => ({
    id: String(r.id),
    direction: r.direction as 'send' | 'recv',
    params: r.params,
  }));
}

function buildSctp(m: sdpTransform.MediaDescription): SctpConfig | undefined {
  // Modern SCTP (sctp-port + max-message-size)
  if (m.sctpPort !== undefined) {
    return {
      port: m.sctpPort,
      maxMessageSize: m.maxMessageSize,
    };
  }

  // Legacy sctpmap
  if (m.sctpmap) {
    return {
      port: m.sctpmap.sctpmapNumber,
      maxMessageSize: m.sctpmap.maxMessageSize,
    };
  }

  return undefined;
}

function buildFingerprint(
  fp: sdpTransform.SharedAttributes['fingerprint'],
): Fingerprint {
  return {
    type: fp?.type ?? '',
    hash: fp?.hash ?? '',
  };
}

function mapMediaSection(m: sdpTransform.MediaDescription): MediaSection {
  return {
    type: m.type as MediaSection['type'],
    port: m.port,
    protocol: m.protocol,
    mid: m.mid ?? '',
    direction: (m.direction ?? 'sendrecv') as MediaSection['direction'],

    codecs: buildCodecs(m),
    headerExtensions: buildHeaderExtensions(m),

    iceUfrag: m.iceUfrag ?? '',
    icePwd: m.icePwd ?? '',
    fingerprint: buildFingerprint(m.fingerprint),
    candidates: buildCandidates(m),

    ssrcs: buildSsrcs(m),
    simulcast: buildSimulcast(m),
    rid: buildRids(m),

    msid: m.msid ?? '',
    rtcpMux: m.rtcpMux === 'rtcp-mux',
    rtcpRsize: m.rtcpRsize === 'rtcp-rsize',

    sctp: buildSctp(m),
  };
}

// ── Session-level mappers ───────────────────────────────────────────

function buildOrigin(
  o: sdpTransform.SessionDescription['origin'],
): SDPOrigin {
  return {
    username: o.username,
    sessionId: String(o.sessionId),
    sessionVersion: String(o.sessionVersion),
    netType: o.netType,
    ipVer: String(o.ipVer),
    address: o.address,
  };
}

function buildGroups(
  groups: sdpTransform.SessionAttributes['groups'],
): BundleGroup[] {
  return (groups ?? []).map((g) => ({
    type: g.type,
    mids: String(g.mids).split(' '),
  }));
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Parse a raw SDP string into a fully-typed `ParsedSDP` object.
 *
 * @throws {Error} if the input is empty or not valid SDP.
 */
export function parseSDP(raw: string): ParsedSDP {
  const normalized = normalize(raw);

  if (!normalized.startsWith('v=0')) {
    throw new Error('Invalid SDP: must start with v=0');
  }

  const parsed = sdpTransform.parse(normalized);

  const result: ParsedSDP = {
    raw,

    origin: buildOrigin(parsed.origin),
    sessionName: parsed.name ?? '',
    timing: `${parsed.timing.start} ${parsed.timing.stop}`,

    groups: buildGroups(parsed.groups),
    fingerprint: buildFingerprint(parsed.fingerprint),
    iceLite: parsed.icelite === 'ice-lite',
    extmapAllowMixed: parsed.extmapAllowMixed === 'extmap-allow-mixed',

    media: (parsed.media ?? []).map(mapMediaSection),

    // Placeholder — overwritten immediately below
    source: 'Unknown',
  };

  result.source = detectSource(result);

  return result;
}

/**
 * Non-throwing validation wrapper around `parseSDP`.
 */
export function validateSDP(raw: string): { valid: boolean; error?: string } {
  try {
    parseSDP(raw);
    return { valid: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { valid: false, error: message };
  }
}
