import { parseSDP } from './dist/parser.js';

// Chrome-like SDP (has extmap-allow-mixed)
const chromeSDP = `v=0
o=- 1234 2 IN IP4 127.0.0.1
s=-
t=0 0
a=extmap-allow-mixed
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=mid:0
a=sendrecv
a=rtpmap:96 AV1/90000`;

// LiveKit-like SDP
const livekitSDP = `v=0
o=livekit 1234 2 IN IP4 127.0.0.1
s=-
t=0 0
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=mid:0
a=rtpmap:111 opus/48000/2`;

try {
  const chrome = parseSDP(chromeSDP);
  console.log('Chrome detection:', chrome.source); // expect 'Chrome'
  
  const livekit = parseSDP(livekitSDP);
  console.log('LiveKit detection:', livekit.source); // expect 'LiveKit'
  
  console.log(chrome.source === 'Chrome' ? '✅ Chrome detected' : '❌ Chrome FAILED');
  console.log(livekit.source === 'LiveKit' ? '✅ LiveKit detected' : '❌ LiveKit FAILED');
} catch(e) {
  console.error('❌ Error:', e.message);
}
