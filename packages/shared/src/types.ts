// ── SDP Source Detection ─────────────────────────────────────────────

export type SDPSource =
  | 'Chrome'
  | 'Firefox'
  | 'Safari'
  | 'LiveKit'
  | 'Daily.co'
  | 'mediasoup'
  | 'Pion'
  | 'Janus'
  | 'Unknown';

// ── Primitive / Leaf Interfaces ──────────────────────────────────────

export interface Fingerprint {
  /** e.g. "sha-256" */
  type: string;
  /** colon-separated hex hash */
  hash: string;
}

export interface SDPOrigin {
  username: string;
  sessionId: string;
  sessionVersion: string;
  netType: string;
  ipVer: string;
  address: string;
}

export interface BundleGroup {
  /** e.g. "BUNDLE" */
  type: string;
  /** MID values grouped together */
  mids: string[];
}

// ── Codec & Extensions ──────────────────────────────────────────────

export interface Codec {
  payloadType: number;
  name: string;
  clockRate: number;
  channels?: number;
  /** Parsed fmtp key-value pairs */
  fmtp: Record<string, string>;
  /** Payload type of the associated RTX stream */
  rtx?: number;
}

export interface HeaderExtension {
  /** Numeric local identifier */
  value: number;
  /** URN of the extension */
  uri: string;
  direction?: string;
}

// ── ICE ─────────────────────────────────────────────────────────────

export interface IceCandidate {
  foundation: string;
  component: number;
  transport: 'UDP' | 'TCP';
  priority: number;
  ip: string;
  port: number;
  type: 'host' | 'srflx' | 'relay' | 'prflx';
  raddr?: string;
  rport?: number;
}

// ── SSRC ────────────────────────────────────────────────────────────

export interface SSRC {
  id: number;
  attribute: string;
  value?: string;
}

// ── Simulcast & RID ─────────────────────────────────────────────────

export interface SimulcastConfig {
  send?: string[];
  recv?: string[];
}

export interface RidConfig {
  id: string;
  direction: 'send' | 'recv';
  params?: string;
}

// ── SCTP (Data Channels) ────────────────────────────────────────────

export interface SctpConfig {
  port: number;
  maxMessageSize?: number;
}

// ── Media Section ───────────────────────────────────────────────────

export interface MediaSection {
  type: 'audio' | 'video' | 'application';
  port: number;
  protocol: string;
  mid: string;
  direction: 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive';

  codecs: Codec[];
  headerExtensions: HeaderExtension[];

  iceUfrag: string;
  icePwd: string;
  fingerprint: Fingerprint;
  candidates: IceCandidate[];

  ssrcs: SSRC[];
  simulcast?: SimulcastConfig;
  rid?: RidConfig[];

  msid: string;
  rtcpMux: boolean;
  rtcpRsize: boolean;

  sctp?: SctpConfig;
}

// ── Top-Level Parsed SDP ────────────────────────────────────────────

export interface ParsedSDP {
  /** Original raw SDP string */
  raw: string;

  origin: SDPOrigin;
  sessionName: string;
  timing: string;

  groups: BundleGroup[];
  fingerprint: Fingerprint;
  iceLite: boolean;
  extmapAllowMixed: boolean;

  media: MediaSection[];

  /** Detected SDP originator */
  source: SDPSource;
}
