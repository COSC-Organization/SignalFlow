import { parseSDP } from './dist/parser.js';
import { runDiagnostics } from './dist/diagnostics/index.js';

// Intentionally broken SDP — no TURN, no RTX, AV1 not in answer
const brokenOffer = `v=0
o=- 1234 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
m=video 9 UDP/TLS/RTP/SAVPF 96 98
c=IN IP4 0.0.0.0
a=mid:0
a=sendrecv
a=ice-ufrag:same1
a=ice-pwd:samepassword12345678901234
a=candidate:1 1 UDP 2130706431 192.168.1.1 54321 typ host
a=rtpmap:96 VP8/90000
a=rtpmap:98 AV1/90000`;

const brokenAnswer = `v=0
o=- 5678 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=mid:0
a=sendrecv
a=ice-ufrag:same1
a=ice-pwd:samepassword12345678901234
a=candidate:1 1 UDP 2130706431 192.168.1.1 54322 typ host
a=rtpmap:96 VP8/90000`;

const sdp1 = parseSDP(brokenOffer);
const sdp2 = parseSDP(brokenAnswer);
const issues = runDiagnostics(sdp1, sdp2);

console.log('Total issues found:', issues.length);
issues.forEach(i => console.log(`  [${i.severity}] ${i.id}: ${i.title}`));

const checks = [
  ['ice-same-credentials', 'error'],
  ['ice-no-turn-candidates', 'warning'],
  ['ice-only-host-candidates', 'warning'],
  ['codec-av1-not-negotiated', 'info'],
  ['codec-missing-rtx', 'warning'],
];

checks.forEach(([id, expectedSeverity]) => {
  const found = issues.find(i => i.id === id);
  if (found && found.severity === expectedSeverity) {
    console.log(`✅ ${id}`);
  } else {
    console.log(`❌ ${id} — expected severity ${expectedSeverity}, got: ${found?.severity || 'NOT FOUND'}`);
  }
});
