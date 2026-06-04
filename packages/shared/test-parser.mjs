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

let failed = false;

try {
  const result = parseSDP(testSDP);
  console.log('✅ Parsed OK');
  if (result.media.length !== 2) {
    console.error('❌ Media sections count is not 2, got:', result.media.length);
    failed = true;
  }
  if (!result.media[0].codecs.map(c => c.name).includes('opus')) {
    console.error('❌ Expected audio codec opus, got:', result.media[0].codecs.map(c => c.name));
    failed = true;
  }
  if (!result.media[1].codecs.map(c => c.name).includes('VP8')) {
    console.error('❌ Expected video codec VP8, got:', result.media[1].codecs.map(c => c.name));
    failed = true;
  }
  if (result.media[1].codecs[0].rtx !== 97) {
    console.error('❌ Expected VP8 RTX map 97, got:', result.media[1].codecs[0].rtx);
    failed = true;
  }
  if (result.media[0].iceUfrag !== 'abc123') {
    console.error('❌ Expected ICE ufrag abc123, got:', result.media[0].iceUfrag);
    failed = true;
  }
} catch(e) {
  console.error('❌ FAILED:', e.message);
  failed = true;
}

try {
  parseSDP('not an sdp');
  console.error('❌ Should have thrown on invalid SDP');
  failed = true;
} catch(e) {
  console.log('✅ Correctly threw on invalid SDP:', e.message);
}

if (failed) {
  process.exit(1);
}
