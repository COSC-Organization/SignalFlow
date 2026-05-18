// ── Example SDP pairs for the homepage gallery ─────────────────────

export interface ExampleSDP {
  sdp1: string;
  sdp2: string;
  title: string;
}

// ────────────────────────────────────────────────────────────────────
// 1. Missing TURN — only host candidates, will fail behind NAT
// ────────────────────────────────────────────────────────────────────

export const EXAMPLE_MISSING_TURN: ExampleSDP = {
  title: 'Missing TURN server',
  sdp1: [
    'v=0',
    'o=- 4321987650 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0',
    'a=extmap-allow-mixed',
    'a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99',
    'm=audio 9 UDP/TLS/RTP/SAVPF 111',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sendrecv',
    'a=ice-ufrag:offrUf01',
    'a=ice-pwd:offrPwd01longEnoughForWebRTC',
    'a=rtpmap:111 opus/48000/2',
    'a=fmtp:111 minptime=10;useinbandfec=1',
    'a=candidate:1 1 UDP 2130706431 192.168.1.10 54321 typ host',
    'a=candidate:2 1 UDP 2130706175 192.168.1.10 54322 typ host',
  ].join('\r\n'),
  sdp2: [
    'v=0',
    'o=- 8765432100 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0',
    'a=extmap-allow-mixed',
    'a=fingerprint:sha-256 BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA',
    'm=audio 9 UDP/TLS/RTP/SAVPF 111',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sendrecv',
    'a=ice-ufrag:ansrUf01',
    'a=ice-pwd:ansrPwd01longEnoughForWebRTC',
    'a=rtpmap:111 opus/48000/2',
    'a=fmtp:111 minptime=10;useinbandfec=1',
    'a=candidate:1 1 UDP 2130706431 10.0.0.5 60001 typ host',
  ].join('\r\n'),
};

// ────────────────────────────────────────────────────────────────────
// 2. Chrome → Safari codec gap — offer has AV1+VP8, Safari only VP8
// ────────────────────────────────────────────────────────────────────

export const EXAMPLE_CHROME_SAFARI: ExampleSDP = {
  title: 'Chrome → Safari codec gap',
  sdp1: [
    'v=0',
    'o=- 1111111111 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0 1',
    'a=extmap-allow-mixed',
    'a=fingerprint:sha-256 11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD:EE:FF',
    'm=audio 9 UDP/TLS/RTP/SAVPF 111',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sendrecv',
    'a=ice-ufrag:chromeUf',
    'a=ice-pwd:chromePwdLongEnoughForRTC1',
    'a=rtpmap:111 opus/48000/2',
    'a=fmtp:111 minptime=10;useinbandfec=1;stereo=1',
    'm=video 9 UDP/TLS/RTP/SAVPF 96 97 98',
    'c=IN IP4 0.0.0.0',
    'a=mid:1',
    'a=sendrecv',
    'a=ice-ufrag:chromeUf',
    'a=ice-pwd:chromePwdLongEnoughForRTC1',
    'a=rtpmap:96 VP8/90000',
    'a=rtpmap:97 rtx/90000',
    'a=fmtp:97 apt=96',
    'a=rtpmap:98 AV1/90000',
  ].join('\r\n'),
  sdp2: [
    'v=0',
    'o=- 2222222222 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0 1',
    'a=fingerprint:sha-256 FF:EE:DD:CC:BB:AA:00:99:88:77:66:55:44:33:22:11:FF:EE:DD:CC:BB:AA:00:99:88:77:66:55:44:33:22:11',
    'm=audio 9 UDP/TLS/RTP/SAVPF 111',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sendrecv',
    'a=ice-ufrag:safariUf',
    'a=ice-pwd:safariPwdLongEnoughForRTC1',
    'a=rtpmap:111 opus/48000/2',
    'a=fmtp:111 minptime=10;useinbandfec=1',
    'm=video 9 UDP/TLS/RTP/SAVPF 96 97',
    'c=IN IP4 0.0.0.0',
    'a=mid:1',
    'a=sendrecv',
    'a=ice-ufrag:safariUf',
    'a=ice-pwd:safariPwdLongEnoughForRTC1',
    'a=rtpmap:96 VP8/90000',
    'a=rtpmap:97 rtx/90000',
    'a=fmtp:97 apt=96',
  ].join('\r\n'),
};

// ────────────────────────────────────────────────────────────────────
// 3. Simulcast RID mismatch — offer sends h/m/l, answer only h/q
// ────────────────────────────────────────────────────────────────────

export const EXAMPLE_SIMULCAST_BROKEN: ExampleSDP = {
  title: 'Simulcast RID mismatch',
  sdp1: [
    'v=0',
    'o=- 3333333333 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0',
    'a=extmap-allow-mixed',
    'a=fingerprint:sha-256 AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89',
    'm=video 9 UDP/TLS/RTP/SAVPF 96',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sendrecv',
    'a=ice-ufrag:simOffrU',
    'a=ice-pwd:simOffrPwdLongEnoughForRTC',
    'a=rtpmap:96 VP8/90000',
    'a=rid:h send',
    'a=rid:m send',
    'a=rid:l send',
    'a=simulcast:send h;m;l',
  ].join('\r\n'),
  sdp2: [
    'v=0',
    'o=- 4444444444 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0',
    'a=extmap-allow-mixed',
    'a=fingerprint:sha-256 FE:DC:BA:98:76:54:32:10:FE:DC:BA:98:76:54:32:10:FE:DC:BA:98:76:54:32:10:FE:DC:BA:98:76:54:32:10',
    'm=video 9 UDP/TLS/RTP/SAVPF 96',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sendrecv',
    'a=ice-ufrag:simAnsrU',
    'a=ice-pwd:simAnsrPwdLongEnoughForRTC',
    'a=rtpmap:96 VP8/90000',
    'a=rid:h recv',
    'a=rid:q recv',
    'a=simulcast:recv h;q',
  ].join('\r\n'),
};

// ────────────────────────────────────────────────────────────────────
// 4. Healthy — everything matches, proper credentials
// ────────────────────────────────────────────────────────────────────

export const EXAMPLE_HEALTHY: ExampleSDP = {
  title: 'Healthy negotiation',
  sdp1: [
    'v=0',
    'o=- 5555555555 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0 1',
    'a=extmap-allow-mixed',
    'a=fingerprint:sha-256 A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90',
    'm=audio 9 UDP/TLS/RTP/SAVPF 111',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sendrecv',
    'a=ice-ufrag:hlthOff1',
    'a=ice-pwd:hlthOffPwd1LongEnoughRTC!',
    'a=rtpmap:111 opus/48000/2',
    'a=fmtp:111 minptime=10;useinbandfec=1',
    'a=candidate:1 1 UDP 2130706431 192.168.1.5 45000 typ host',
    'a=candidate:2 1 UDP 1694498815 203.0.113.5 55000 typ srflx raddr 192.168.1.5 rport 45000',
    'a=candidate:3 1 UDP 16777215 198.51.100.10 60000 typ relay raddr 203.0.113.5 rport 55000',
    'm=video 9 UDP/TLS/RTP/SAVPF 96 97',
    'c=IN IP4 0.0.0.0',
    'a=mid:1',
    'a=sendrecv',
    'a=ice-ufrag:hlthOff1',
    'a=ice-pwd:hlthOffPwd1LongEnoughRTC!',
    'a=rtpmap:96 VP8/90000',
    'a=rtpmap:97 rtx/90000',
    'a=fmtp:97 apt=96',
    'a=candidate:1 1 UDP 2130706431 192.168.1.5 45000 typ host',
    'a=candidate:2 1 UDP 1694498815 203.0.113.5 55000 typ srflx raddr 192.168.1.5 rport 45000',
    'a=candidate:3 1 UDP 16777215 198.51.100.10 60000 typ relay raddr 203.0.113.5 rport 55000',
  ].join('\r\n'),
  sdp2: [
    'v=0',
    'o=- 6666666666 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0 1',
    'a=extmap-allow-mixed',
    'a=fingerprint:sha-256 F0:E1:D2:C3:B4:A5:96:87:78:69:5A:4B:3C:2D:1E:0F:F0:E1:D2:C3:B4:A5:96:87:78:69:5A:4B:3C:2D:1E:0F',
    'm=audio 9 UDP/TLS/RTP/SAVPF 111',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sendrecv',
    'a=ice-ufrag:hlthAns1',
    'a=ice-pwd:hlthAnsPwd1LongEnoughRTC!',
    'a=rtpmap:111 opus/48000/2',
    'a=fmtp:111 minptime=10;useinbandfec=1',
    'a=candidate:1 1 UDP 2130706431 10.0.0.20 46000 typ host',
    'a=candidate:2 1 UDP 1694498815 198.51.100.20 56000 typ srflx raddr 10.0.0.20 rport 46000',
    'a=candidate:3 1 UDP 16777215 203.0.113.20 61000 typ relay raddr 198.51.100.20 rport 56000',
    'm=video 9 UDP/TLS/RTP/SAVPF 96 97',
    'c=IN IP4 0.0.0.0',
    'a=mid:1',
    'a=sendrecv',
    'a=ice-ufrag:hlthAns1',
    'a=ice-pwd:hlthAnsPwd1LongEnoughRTC!',
    'a=rtpmap:96 VP8/90000',
    'a=rtpmap:97 rtx/90000',
    'a=fmtp:97 apt=96',
    'a=candidate:1 1 UDP 2130706431 10.0.0.20 46000 typ host',
    'a=candidate:2 1 UDP 1694498815 198.51.100.20 56000 typ srflx raddr 10.0.0.20 rport 46000',
    'a=candidate:3 1 UDP 16777215 203.0.113.20 61000 typ relay raddr 198.51.100.20 rport 56000',
  ].join('\r\n'),
};

// ── Lookup map keyed by URL slug ────────────────────────────────────

export const EXAMPLES_BY_SLUG: Record<string, ExampleSDP> = {
  'missing-turn': EXAMPLE_MISSING_TURN,
  'chrome-safari': EXAMPLE_CHROME_SAFARI,
  'simulcast-broken': EXAMPLE_SIMULCAST_BROKEN,
  'healthy': EXAMPLE_HEALTHY,
};
