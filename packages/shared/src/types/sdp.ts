export interface SdpMedia {
  type: string; // e.g., 'audio', 'video', 'application'
  port: number;
  protocol: string; // e.g., 'UDP/TLS/RTP/SAVPF'
  payloads: string;
  connection?: { version: number; ip: string };
  direction?: 'sendrecv' | 'recvonly' | 'sendonly' | 'inactive';
  rtp?: Array<{ payload: number; codec: string; rate: number; encoding?: number }>;
  fmtp?: Array<{ payload: number; config: string }>;
  candidates?: Array<{ foundation: string; component: number; transport: string; priority: number; ip: string; port: number; type: string }>;
  [key: string]: any; // Catch-all for other attributes like mid, iceUfrag, etc.
}

export interface SessionDescription {
  version: number;
  origin: { username: string; sessionId: string | number; sessionVersion: number; netType: string; ipVer: number; address: string };
  name: string;
  timing: { start: number; stop: number };
  connection?: { version: number; ip: string };
  groups?: Array<{ type: string; mids: string }>;
  media: SdpMedia[];
  [key: string]: any; 
}
