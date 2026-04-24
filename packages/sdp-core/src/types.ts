export interface ParsedSDP {
  raw: string;
  origin: SDPOrigin;
  sessionName: string;
  timing: { start: number; stop: number };
  groups: BundleGroup[];
  iceOptions?: string;
  fingerprint?: Fingerprint;
  iceLite?: boolean;
  extmapAllowMixed?: boolean;
  media: MediaSection[];
  // metadata added by detector
  source?: SDPSource;
}

export interface SDPOrigin {
  username: string;
  sessionId: string;
  sessionVersion: number;
  netType: string;
  ipVer: number;
  address: string;
}

export interface MediaSection {
  type: 'audio' | 'video' | 'application'; // application = data channel
  port: number;
  protocol: string;
  mid: string;
  direction: 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive';
  codecs: Codec[];
  headerExtensions: HeaderExtension[];
  rtcpFeedback: RtcpFeedback[];
  iceUfrag?: string;
  icePwd?: string;
  fingerprint?: Fingerprint;
  candidates: IceCandidate[];
  ssrcs: SSRC[];
  simulcast?: SimulcastConfig;
  rid?: RidConfig[];
  msid?: string;
  rtcpMux: boolean;
  rtcpRsize: boolean;
  sctp?: SctpConfig; // for data channels
}

export interface Codec {
  payloadType: number;
  name: string;
  clockRate: number;
  channels?: number;
  fmtp: Record<string, string>;
  rtx?: number; // RTX payload type if present
  red?: number; // RED payload type if present
}

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

export interface Fingerprint {
  type: string; // sha-256, sha-1, etc.
  hash: string;
}

export interface SimulcastConfig {
  send?: string[];  // rid values for send
  recv?: string[];  // rid values for recv
}

export interface RidConfig {
  id: string;
  direction: 'send' | 'recv';
  params?: Record<string, string>;
}

export interface HeaderExtension {
  value: number;
  uri: string;
  direction?: string;
}

export interface SSRC {
  id: number;
  attribute: string;
  value?: string;
}

export interface BundleGroup {
  type: string;
  mids: string[];
}

export interface SctpConfig {
  port: number;
  maxMessageSize?: number;
}

export interface RtcpFeedback {
  payloadType: number;
  type: string;
  subtype?: string;
}

// Detector output
export type SDPSource =
  | 'Chrome'
  | 'Firefox'
  | 'Safari'
  | 'LiveKit'
  | 'Daily.co'
  | 'mediasoup'
  | 'Pion'
  | 'Janus'
  | 'Jitsi'
  | '100ms'
  | 'Unknown';
