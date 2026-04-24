import * as sdpTransform from 'sdp-transform';
import type { ParsedSDP, MediaSection, Codec, IceCandidate } from './types';
import { detectSource } from './detector';

export function parseSDP(raw: string): ParsedSDP {
  // Normalize line endings — copy-pasted SDPs often have \n not \r\n
  const normalized = raw.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');

  if (!normalized.startsWith('v=0')) {
    throw new Error('Invalid SDP: must start with v=0');
  }

  const parsed = sdpTransform.parse(normalized);

  const media: MediaSection[] = (parsed.media || []).map((m): MediaSection => {
    // Build codec map from rtpmap + fmtp
    const codecMap: Record<number, Codec> = {};
    (m.rtp || []).forEach(rtp => {
      codecMap[rtp.payload] = {
        payloadType: rtp.payload,
        name: rtp.codec,
        clockRate: rtp.rate || 90000,
        channels: rtp.encoding ? parseInt(rtp.encoding as string) : undefined,
        fmtp: {},
      };
    });
    (m.fmtp || []).forEach(f => {
      if (codecMap[f.payload]) {
        codecMap[f.payload].fmtp = sdpTransform.parseParams(f.config);
      }
    });

    // Detect RTX associations
    Object.values(codecMap).forEach(codec => {
      if (codec.name === 'rtx' && codec.fmtp['apt']) {
        const apt = parseInt(codec.fmtp['apt']);
        if (codecMap[apt]) codecMap[apt].rtx = codec.payloadType;
      }
      if (codec.name === 'red') {
        // Find associated codec
      }
    });

    // Parse ICE candidates
    const candidates: IceCandidate[] = (m.candidates || []).map(c => ({
      foundation: c.foundation,
      component: c.component,
      transport: c.transport as 'UDP' | 'TCP',
      priority: c.priority,
      ip: c.ip,
      port: c.port,
      type: c.type as IceCandidate['type'],
      raddr: c.raddr,
      rport: c.rport,
    }));

    // Parse simulcast
    let simulcast: MediaSection['simulcast'];
    if (m.simulcast) {
      simulcast = {
        send: m.simulcast.dir1 === 'send' ? m.simulcast.list1?.split(';') : undefined,
        recv: m.simulcast.dir1 === 'recv' ? m.simulcast.list1?.split(';') : undefined,
      };
    }

    return {
      type: m.type as MediaSection['type'],
      port: m.port,
      protocol: m.protocol,
      mid: m.mid || '0',
      direction: (m.direction || 'sendrecv') as MediaSection['direction'],
      codecs: Object.values(codecMap).filter(c => c.name !== 'rtx' && c.name !== 'red'),
      headerExtensions: (m.ext || []).map(e => ({
        value: e.value,
        uri: e.uri,
        direction: e.direction,
      })),
      rtcpFeedback: [],
      iceUfrag: m.iceUfrag,
      icePwd: m.icePwd,
      fingerprint: m.fingerprint
        ? { type: m.fingerprint.type, hash: m.fingerprint.hash }
        : undefined,
      candidates,
      ssrcs: (m.ssrcs || []).map(s => ({
        id: s.id,
        attribute: s.attribute,
        value: s.value,
      })),
      simulcast,
      rid: (m.rids || []).map(r => ({
        id: r.id,
        direction: r.direction as 'send' | 'recv',
      })),
      msid: m.msid,
      rtcpMux: !!m.rtcpMux,
      rtcpRsize: !!m.rtcpRsize,
      sctp: m.sctpPort
        ? { port: m.sctpPort, maxMessageSize: m.maxMessageSize }
        : undefined,
    };
  });

  const result: ParsedSDP = {
    raw: normalized,
    origin: {
      username: parsed.origin?.username || '-',
      sessionId: parsed.origin?.sessionId?.toString() || '0',
      sessionVersion: parsed.origin?.sessionVersion || 0,
      netType: parsed.origin?.netType || 'IN',
      ipVer: parsed.origin?.ipVer || 4,
      address: parsed.origin?.address || '0.0.0.0',
    },
    sessionName: parsed.name || '',
    timing: { start: parsed.timing?.start || 0, stop: parsed.timing?.stop || 0 },
    groups: (parsed.groups || []).map(g => ({
      type: g.type,
      mids: g.mids.split(' '),
    })),
    fingerprint: parsed.fingerprint
      ? { type: parsed.fingerprint.type, hash: parsed.fingerprint.hash }
      : undefined,
    iceLite: !!parsed.iceLite,
    extmapAllowMixed: !!(parsed as any)['extmap-allow-mixed'],
    media,
  };

  result.source = detectSource(result);
  return result;
}
