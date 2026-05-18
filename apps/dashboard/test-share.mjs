import { deflate, inflate } from 'pako';

// Simulate saveToHash and loadFromHash logic
function saveToHash(sdp1, sdp2) {
  const data = JSON.stringify({ sdp1, sdp2 });
  const compressed = deflate(data);
  return encodeURIComponent(btoa(String.fromCharCode(...compressed)));
}

function loadFromHash(hash) {
  try {
    const decoded = decodeURIComponent(hash);
    const compressed = Uint8Array.from(atob(decoded), c => c.charCodeAt(0));
    const data = inflate(compressed, { to: 'string' });
    return JSON.parse(data);
  } catch(e) { return null; }
}

const sdp1 = 'v=0\r\no=- 1234 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0';
const sdp2 = 'v=0\r\no=- 5678 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0';

const hash = saveToHash(sdp1, sdp2);
console.log('Hash length:', hash.length, '(should be < 500 for short SDPs)');

const loaded = loadFromHash(hash);
console.log(loaded?.sdp1 === sdp1 ? '✅ sdp1 round-trips correctly' : '❌ sdp1 MISMATCH');
console.log(loaded?.sdp2 === sdp2 ? '✅ sdp2 round-trips correctly' : '❌ sdp2 MISMATCH');
console.log(loadFromHash('') === null ? '✅ Empty hash returns null' : '❌ Empty hash broken');
console.log(loadFromHash('notvalidbase64!!!') === null ? '✅ Invalid hash returns null' : '❌ Invalid hash broken');
