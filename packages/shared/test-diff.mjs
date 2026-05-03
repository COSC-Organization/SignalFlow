import { parseSDP } from './dist/parser.js';
import { diffSDPs } from './dist/diff/sdp-diff.js';

const offer = `v=0
o=- 1234 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=mid:0
a=sendrecv
a=ice-ufrag:offer1
a=ice-pwd:offerpass1234567890123456
a=rtpmap:111 opus/48000/2
m=video 9 UDP/TLS/RTP/SAVPF 96 98
c=IN IP4 0.0.0.0
a=mid:1
a=sendrecv
a=ice-ufrag:offer1
a=ice-pwd:offerpass1234567890123456
a=rtpmap:96 VP8/90000
a=rtpmap:98 AV1/90000`;

const answer = `v=0
o=- 5678 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
a=fingerprint:sha-256 BB:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=mid:0
a=sendrecv
a=ice-ufrag:answer1
a=ice-pwd:answerpass123456789012345
a=rtpmap:111 opus/48000/2
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=mid:1
a=sendrecv
a=ice-ufrag:answer1
a=ice-pwd:answerpass123456789012345
a=rtpmap:96 VP8/90000`;

try {
  const sdp1 = parseSDP(offer);
  const sdp2 = parseSDP(answer);
  const result = diffSDPs(sdp1, sdp2);

  console.log('Total diff items:', result.items.length);
  console.log('Summary:', result.summary);
  
  // AV1 should be detected as removed (offer had it, answer doesn't)
  // Let's print out all items to see their structure if the search fails
  console.log('Diff items paths:', result.items.map(i => i.path));
  console.log('Diff items labels:', result.items.map(i => i.label));

  const av1Removed = result.items.find(i => i.label.includes('AV1') && i.type === 'removed');
  console.log(av1Removed ? '✅ AV1 removal detected' : '❌ AV1 removal NOT detected');
  
  // Fingerprint change should be detected
  const fpChange = result.items.find(i => i.path.includes('fingerprint'));
  console.log(fpChange ? '✅ Fingerprint change detected' : '❌ Fingerprint change NOT detected');

  console.log('Media changes count:', result.mediaChanges.length); // expect 2
} catch(e) {
  console.error('❌ Error:', e.message, e.stack);
}
