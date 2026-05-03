import { parseSDP } from './dist/parser.js';

const testSDP = `v=0
o=- 4611731400430051336 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:abc123
a=ice-pwd:def456789012345678901234
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
a=setup:actpass
a=mid:0
a=sendrecv
a=rtpmap:111 opus/48000/2
m=video 9 UDP/TLS/RTP/SAVPF 96 97
c=IN IP4 0.0.0.0
a=ice-ufrag:abc123
a=ice-pwd:def456789012345678901234
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
a=setup:actpass
a=mid:1
a=sendrecv
a=rtpmap:96 VP8/90000
a=rtpmap:97 rtx/90000
a=fmtp:97 apt=96`;

try {
  const result = parseSDP(testSDP);
  console.log('✅ Parsed OK');
  console.log('Media sections:', result.media.length); // expect 2
  console.log('Audio codecs:', result.media[0].codecs.map(c => c.name)); // expect ['opus']
  console.log('Video codecs:', result.media[1].codecs.map(c => c.name)); // expect ['VP8']
  console.log('VP8 has RTX:', result.media[1].codecs[0].rtx); // expect 97
  console.log('ICE ufrag:', result.media[0].iceUfrag); // expect 'abc123'
} catch(e) {
  console.error('❌ FAILED:', e.message);
}

try {
  parseSDP('not an sdp');
  console.error('❌ Should have thrown');
} catch(e) {
  console.log('✅ Correctly threw on invalid SDP:', e.message);
}
