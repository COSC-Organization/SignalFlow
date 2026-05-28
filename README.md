# SignalFlow

**The missing debugger for WebRTC + WebSocket developers.**

Paste two SDP strings. Instantly get a visual diff, browser source detection, and plain-English diagnosis of every failure — with a shareable link your teammate can open in one click.

> Built for developers who have ever stared at `chrome://webrtc-internals` at 2am wondering why their video call is silently failing.

---

## What is this?

WebRTC debugging is uniquely painful. When a call fails, you're left with:

- Raw SDP text with no visual structure
- `chrome://webrtc-internals` showing stats with no explanation
- No connection between the signaling decisions you made and the media failure you got

SignalFlow fixes the first problem completely. You paste your Offer and Answer SDPs, and within milliseconds you see:

- **What changed** between them — codec removals, ICE credential mismatches, fingerprint differences — in a color-coded visual diff
- **Why it might fail** — 25 diagnostic rules covering ICE, DTLS, codecs, simulcast, and BUNDLE, each with a plain-English explanation and a concrete fix
- **Who generated it** — automatic detection of Chrome, Firefox, Safari, LiveKit, mediasoup, Pion, Daily.co, and more
- **A shareable link** — your entire comparison encoded in the URL, no backend, no login

---

## Live demo

👉 **[signalflow.cosc25.in](https://signalflow.cosc25.in)**

Try a pre-loaded failure scenario on the homepage — no SDP required to see the tool in action.

---

## Screenshots

```
[Homepage with example gallery]
[SDP comparison with diff viewer and issues panel]
[Mobile layout]
```

---

## Features

### SDP Visual Diff

Compares two SDP strings semantically — not line by line. Sections are matched by `mid` value, so a reordered SDP doesn't produce false positives.

Each media section (audio, video, data channel) is collapsible and shows:

| Field | Before | After | Status |
|-------|--------|-------|--------|
| Codecs | VP8, AV1 | VP8 | 🔴 removed |
| ICE ufrag | abc123 | xyz789 | 🟡 changed |
| Direction | sendrecv | sendrecv | ✅ same |

Color coding: green = added, red = removed, yellow = changed.

### Browser / SDK Auto-Detection

Paste any SDP and SignalFlow identifies where it came from using signature detection:

| Source | Detection signals |
|--------|------------------|
| Chrome | `extmap-allow-mixed` present, sha-256 fingerprint, AV1 codec |
| Firefox | Origin address `0.0.0.0`, no extmap-allow-mixed, specific header extension URIs |
| Safari | sha-1 fingerprint, no AV1 support |
| LiveKit | `origin.username = livekit` or livekit in raw |
| mediasoup | `origin.username = mediasoup` |
| Pion | `origin.username = pion` or `pion-` in raw |
| Daily.co | `origin.username = daily` or daily.co in raw |
| Janus | `origin.username = janus` |

### 25 Diagnostic Rules

Every rule returns a severity level, a plain-English explanation of what went wrong, and a concrete fix — written like a Stack Overflow answer, not a spec reference.

#### ICE Rules
| ID | Severity | What it catches |
|----|----------|-----------------|
| `ice-missing-credentials` | 🔴 Error | No `a=ice-ufrag` or `a=ice-pwd` in a media section |
| `ice-no-turn-candidates` | 🟡 Warning | No relay candidates — will fail for ~15% of users behind symmetric NAT |
| `ice-same-credentials` | 🔴 Error | Offer and answer have identical ICE ufrag — copy-paste error |
| `ice-only-host-candidates` | 🟡 Warning | STUN gathering incomplete, only local addresses present |
| `ice-no-candidates-at-all` | 🔴 Error | Zero ICE candidates across all media sections |

#### DTLS Rules
| ID | Severity | What it catches |
|----|----------|-----------------|
| `dtls-missing-fingerprint` | 🔴 Error | No `a=fingerprint` — DTLS handshake will fail immediately |
| `dtls-sha1-fingerprint` | 🟡 Warning | SHA-1 fingerprint detected (weak, legacy Safari) |
| `dtls-role-conflict` | 🔴 Error | Both sides claim DTLS `active` — handshake deadlock |

#### Codec Rules
| ID | Severity | What it catches |
|----|----------|-----------------|
| `codec-no-common-video` | 🔴 Error | No shared video codec between offer and answer |
| `codec-av1-not-negotiated` | ℹ️ Info | AV1 offered but not accepted — falling back to VP9/VP8 |
| `codec-no-opus` | 🟡 Warning | Opus missing from audio section |
| `codec-missing-rtx` | 🟡 Warning | RTX retransmission stripped — poor quality on lossy networks |
| `codec-opus-stereo-mismatch` | ℹ️ Info | Stereo Opus parameter disagreement between peers |

#### Simulcast Rules
| ID | Severity | What it catches |
|----|----------|-----------------|
| `simulcast-not-accepted` | 🟡 Warning | Simulcast offered but answer didn't accept it |
| `simulcast-rid-mismatch` | 🔴 Error | RID values don't match — SFU will drop video layers |
| `simulcast-missing-rtx` | 🟡 Warning | Simulcast layers without RTX support |

#### BUNDLE Rules
| ID | Severity | What it catches |
|----|----------|-----------------|
| `bundle-missing` | 🟡 Warning | No BUNDLE group — each media section opens a separate connection |
| `bundle-mid-mismatch` | 🔴 Error | BUNDLE group references MIDs that don't exist in media sections |

#### General Rules
| ID | Severity | What it catches |
|----|----------|-----------------|
| `rtcp-mux-missing` | 🟡 Warning | No `a=rtcp-mux` — using double the ports |
| `data-channel-sctp-missing` | 🔴 Error | Data channel section has no SCTP config |
| `no-candidates-at-all` | 🔴 Error | Absolutely zero ICE candidates anywhere |
| `msid-missing-video` | 🟡 Warning | Video has no msid — track won't attach to MediaStream |
| `extmap-allow-mixed-mismatch` | ℹ️ Info | Header extension policy differs between peers |
| `session-fingerprint-conflict` | 🔴 Error | Session-level and media-level fingerprints conflict |
| `ice-lite-mismatch` | 🔴 Error | ICE lite declared on one side only |

### Zero-Backend Shareable Links

Both SDP strings are compressed using `pako` (deflate) and encoded into the URL fragment. No server. No database. No login.

```
signalflow.dev/compare#H4sIAAAAAAAAE6tWKkktLlGyUlIqS...
```

Open the link → exact comparison loads instantly. Works offline.

### Console Snippet

Capture SDP from any WebRTC app without touching the source code:

```javascript
// Paste in browser DevTools on any WebRTC app
const _orig = RTCPeerConnection.prototype.setLocalDescription;
RTCPeerConnection.prototype.setLocalDescription = function(desc) {
  if (desc?.sdp) {
    console.log('%c[SignalFlow] ' + desc.type.toUpperCase(), 'color: #34d399; font-weight: bold');
    console.log(desc.sdp);
  }
  return _orig.apply(this, arguments);
};
```

Works on Google Meet, Discord, your own app — anything that uses WebRTC in the browser.

---

## Project structure

```
signalflow/
├── apps/
│   └── dashboard/                  ← Next.js 15 App Router
│       ├── app/
│       │   ├── page.tsx            ← Homepage + example gallery
│       │   ├── compare/
│       │   │   └── page.tsx        ← Main SDP diff page
│       │   └── docs/
│       │       └── page.tsx        ← SEO docs
│       ├── components/
│       │   ├── SdpTextarea.tsx
│       │   ├── SdpDiffViewer.tsx
│       │   ├── IssuesPanel.tsx
│       │   ├── ShareButton.tsx
│       │   └── BrowserBadge.tsx
│       └── lib/
│           ├── share.ts            ← pako URL compression
│           └── example-sdps.ts     ← Pre-loaded failure examples
│
└── packages/
    └── shared/                     ← @signalflow/shared (pure TypeScript)
        └── src/
            ├── types.ts            ← All interfaces
            ├── parser.ts           ← sdp-transform wrapper
            ├── detector.ts         ← Browser/SDK detection
            ├── diff/
            │   └── sdp-diff.ts     ← Semantic diff engine
            └── diagnostics/
                ├── index.ts        ← Rule runner
                ├── ice.ts
                ├── dtls.ts
                ├── codecs.ts
                ├── simulcast.ts
                └── bundle.ts
```

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 App Router | App Router + static export for Cloudflare |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent dark UI |
| SDP parsing | `sdp-transform` | 2M+ weekly downloads, used by LiveKit, JsSIP, Matrix |
| URL compression | `pako` (deflate) | Zero backend, SDPs compress 70-80% |
| State | React `useState` + URL fragment | No server state needed in V1 |
| Monorepo | pnpm workspaces | Clean shared package without npm publish |
| Deployment | Cloudflare Pages | Free, global CDN, static export |
| CI | GitHub Actions | Auto-deploy on push to main |

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+

```bash
# Install pnpm if you don't have it
npm install -g pnpm
```

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/signalflow.git
cd signalflow

# Install all dependencies across the monorepo
pnpm install

# Build the shared package first
pnpm --filter @signalflow/shared build

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Building for production

```bash
# Build everything
pnpm build

# Preview the static export locally
npx serve apps/dashboard/out -p 3001
```

---

## Using @signalflow/shared as a library

The core SDP logic is in a separate package and can be used independently:

### Parse an SDP

```typescript
import { parseSDP } from '@signalflow/shared';

const sdp = parseSDP(`v=0
o=- 1234 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
m=audio 9 UDP/TLS/RTP/SAVPF 111
...`);

console.log(sdp.source);           // 'Chrome'
console.log(sdp.media[0].codecs);  // [{ name: 'opus', payloadType: 111, ... }]
console.log(sdp.media[0].iceUfrag); // 'abc123'
```

### Diff two SDPs

```typescript
import { parseSDP, diffSDPs } from '@signalflow/shared';

const offer  = parseSDP(offerString);
const answer = parseSDP(answerString);
const result = diffSDPs(offer, answer);

console.log(result.summary);
// { errors: 1, warnings: 2, changes: 3, additions: 0, removals: 1 }

result.items.forEach(item => {
  console.log(`[${item.type}] ${item.label}: ${item.valueBefore} → ${item.valueAfter}`);
});
```

### Run diagnostics

```typescript
import { parseSDP, runDiagnostics } from '@signalflow/shared';

const offer  = parseSDP(offerString);
const answer = parseSDP(answerString);
const issues = runDiagnostics(offer, answer);

issues.forEach(issue => {
  console.log(`[${issue.severity}] ${issue.title}`);
  console.log(`  Why: ${issue.explanation}`);
  console.log(`  Fix: ${issue.fix}`);
});
```

### Detect browser/SDK source

```typescript
import { parseSDP } from '@signalflow/shared';

const sdp = parseSDP(rawSdpString);
console.log(sdp.source); // 'Chrome' | 'Firefox' | 'Safari' | 'LiveKit' | ...
```

---

## How to get your SDP strings

### From your own app (browser console)

Paste this into DevTools before starting a call:

```javascript
const _orig = RTCPeerConnection.prototype.setLocalDescription;
RTCPeerConnection.prototype.setLocalDescription = function(desc) {
  if (desc?.sdp) {
    console.log('%c[SignalFlow] ' + desc.type.toUpperCase(), 'color: #34d399; font-weight: bold');
    console.log(desc.sdp);
  }
  return _orig.apply(this, arguments);
};
```

### From chrome://webrtc-internals

1. Open `chrome://webrtc-internals` in a new tab
2. Start your WebRTC call in another tab
3. Find your PeerConnection entry
4. Expand "setLocalDescription" or "setRemoteDescription"
5. Copy the `sdp` field value

### From your server logs

If your signaling server logs SDP exchanges (it should), grep for `"type":"offer"` and `"type":"answer"` entries.

---

## Running tests

```bash
# Build shared package
cd packages/shared && pnpm build

# Run the test suite
pnpm test

# Individual logic tests (Node.js, no browser needed)
node tests/test-parser.mjs
node tests/test-detector.mjs
node tests/test-diff.mjs
node tests/test-diagnostics.mjs
node tests/test-share.mjs
```

Expected output for a passing suite:

```
✅ Parsed OK
✅ Chrome detected
✅ LiveKit detected
✅ AV1 removal detected
✅ Fingerprint change detected
✅ ice-same-credentials [error]
✅ ice-no-turn-candidates [warning]
✅ ice-only-host-candidates [warning]
✅ codec-av1-not-negotiated [info]
✅ codec-missing-rtx [warning]
✅ sdp1 round-trips correctly
✅ sdp2 round-trips correctly
✅ Empty hash returns null
✅ Invalid hash returns null
```

---

## Deployment

### Cloudflare Pages (recommended)

```bash
# One-time setup
npm install -g wrangler
wrangler login

# Deploy
pnpm deploy
```

The `deploy` script builds the Next.js static export and pushes to Cloudflare Pages automatically.

### GitHub Actions (auto-deploy)

Add these secrets to your repository:

| Secret | Value |
|--------|-------|
| `CF_API_TOKEN` | Cloudflare API token with Pages:Edit permission |

Every push to `main` triggers a build and deploy automatically.

### Other platforms

Since this is a pure static export (`output: 'export'` in next.config), it deploys to any static host:

```bash
pnpm --filter dashboard build
# Output is in apps/dashboard/out/
# Upload that folder to Vercel, Netlify, S3, GitHub Pages, etc.
```

---

## Why not use existing tools?

| Tool | What it does | What it can't do |
|------|--------------|-----------------|
| `chrome://webrtc-internals` | Shows raw WebRTC stats | No diff, no explanation, not shareable |
| Postman / Insomnia | Test WebSocket messages | No WebRTC awareness at all |
| Wireshark | Deep packet inspection | No SDP semantics, no diagnosis |
| rtcStats | Collects `getStats()` data | No signaling layer, no diff, rule-based only |
| `diff` / VSCode diff | Text comparison | Line-based noise, no semantic understanding |

SignalFlow is the only tool that combines semantic SDP diff + browser detection + diagnostic rules + shareable links in one place, built specifically for the WebRTC debugging workflow.

---

## Roadmap

### V2 — SDK + live capture
- `npm install @signalflow/sdk` — one-line drop-in that wraps `RTCPeerConnection` and captures everything automatically
- Live session view showing ICE gathering progress and DTLS handshake state in real time
- Correlated WebSocket signaling ↔ WebRTC peer state timeline (the feature no other tool has)
- Expand diagnostic rules to 50+ (H.265, SFrame E2EE, scalability modes)

### V3 — AI + chaos
- AI diagnosis powered by Claude API — natural language root cause analysis from session data
- Chaos injection: slow signaling, radio silence, packet loss simulation without custom proxies
- Multi-session analytics: cluster failures by root cause across hundreds of sessions

---

## Contributing

Contributions are welcome, especially:

- **New diagnostic rules** — if you've hit a specific WebRTC failure that isn't caught, open an issue with the SDP that triggered it
- **New browser/SDK signatures** — if your SFU or browser isn't detected correctly
- **Better rule explanations** — if an explanation isn't clear enough for a non-expert

### Adding a diagnostic rule

1. Identify which category it belongs to: `ice`, `dtls`, `codecs`, `simulcast`, or `bundle`
2. Add your rule function to the relevant file in `packages/shared/src/diagnostics/`
3. The function signature is: `(sdp1: ParsedSDP, sdp2: ParsedSDP) => DiagnosticIssue | null`
4. Return `null` if the condition is NOT met — no false positives
5. Write the `explanation` as 2-3 sentences a junior developer can understand
6. Write the `fix` as a concrete action, not a vague suggestion
7. Add a test SDP that triggers your rule to the test suite

```typescript
// Example: new rule in packages/shared/src/diagnostics/ice.ts
export const myNewRule: DiagnosticRule = (sdp1, sdp2) => {
  // return null if condition not met
  if (conditionNotMet) return null;

  return {
    id: 'ice-my-new-rule',
    severity: 'warning',
    category: 'ICE',
    title: 'Short title that appears in the issues list',
    explanation: 'Plain English explanation of what went wrong and why it matters. 2-3 sentences.',
    fix: 'Concrete action the developer should take. No jargon.',
  };
};
```

### Development setup

```bash
git clone https://github.com/yourusername/signalflow.git
cd signalflow
pnpm install
pnpm --filter @signalflow/shared build
pnpm dev
```

The dev server hot-reloads. Changes to `packages/shared` require a rebuild:

```bash
# In a separate terminal
cd packages/shared && pnpm build --watch
```

---

## License

MIT — do whatever you want with it.

If SignalFlow saves you time, consider:
- Starring the repo
- Sharing it in a WebRTC Discord when someone asks "why is my call failing"
- Opening a PR with a new diagnostic rule from a bug you actually hit

---

## Acknowledgements

- [sdp-transform](https://github.com/clux/sdp-transform) — the SDP parsing library this is built on. Used by LiveKit, JsSIP, and the Matrix SDK.
- [WebRTC spec](https://www.w3.org/TR/webrtc/) and [RFC 4566](https://www.rfc-editor.org/rfc/rfc4566) — the primary sources for every diagnostic rule
- Every developer who has ever posted "why is my WebRTC call failing" in a Discord server — this tool is for you

---

*Built by COSC* · [cosc25.in](cosc25.in) 
