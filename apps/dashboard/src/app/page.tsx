'use client';

import { useState } from 'react';
import Link from 'next/link';

const SNIPPET = `const _orig = RTCPeerConnection.prototype.setLocalDescription;
RTCPeerConnection.prototype.setLocalDescription = function(desc) {
  if (desc?.sdp) {
    console.log('%c[SignalFlow] ' + desc.type.toUpperCase(), 'color: #34d399; font-weight: bold');
    console.log(desc.sdp);
  }
  return _orig.apply(this, arguments);
};`;

const EXAMPLES = [
  {
    title: 'Missing TURN server',
    subtitle: 'Will fail for ~15% of users behind corporate NAT',
    dot: 'bg-red-500',
    slug: 'missing-turn',
  },
  {
    title: 'Chrome → Safari codec gap',
    subtitle: "AV1 offered but Safari can't accept it",
    dot: 'bg-yellow-500',
    slug: 'chrome-safari',
  },
  {
    title: 'Simulcast RID mismatch',
    subtitle: 'SFU silently drops video layers',
    dot: 'bg-red-500',
    slug: 'simulcast-broken',
  },
  {
    title: 'Healthy negotiation',
    subtitle: 'What a working offer/answer looks like',
    dot: 'bg-green-500',
    slug: 'healthy',
  },
];

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex min-h-full flex-col" style={{ backgroundColor: '#000000' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-white/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white bg-black">
              <span className="text-sm font-bold text-white">SF</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              SignalFlow
            </h1>
          </div>
          <Link
            href="/compare"
            className="rounded-lg border border-white bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
          >
            Launch app
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Debug WebRTC calls.<br />
            <span className="text-white/60">Understand why they fail.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Paste two SDP strings. Get instant visual diff + plain-English diagnosis of every failure.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-lg border border-white bg-white px-8 py-3.5 font-medium text-black transition-colors hover:bg-black hover:text-white"
            >
              Open SDP Diff &rarr;
            </Link>
          </div>
        </section>

        {/* ── Console Snippet ───────────────────────────────────── */}
        <section className="border-y border-white/20 bg-black">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-2xl font-bold tracking-tight text-white">
                Capture SDP from any app
              </h3>
              <p className="mt-4 text-white/70">
                Paste this in browser DevTools on any WebRTC app — Google Meet, your own app, anything.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/20 bg-black px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-white/20 border border-white/40"></div>
                    <div className="h-3 w-3 rounded-full bg-white/20 border border-white/40"></div>
                    <div className="h-3 w-3 rounded-full bg-white/20 border border-white/40"></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-white/50 font-mono">devtools.js</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="rounded border border-white/20 bg-black px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white hover:text-black"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed text-white">
                  <span className="text-white">const</span> _orig = RTCPeerConnection.prototype.setLocalDescription;
                  <br />
                  RTCPeerConnection.prototype.setLocalDescription = <span className="text-white">function</span>(desc) {'{'}
                  <br />
                  {'  '}<span className="text-white">if</span> (desc?.sdp) {'{'}
                  <br />
                  {'    '}console.log(<span className="text-white">{'"%c[SignalFlow] "'}</span> + desc.type.toUpperCase(), <span className="text-white">{'"color: #34d399; font-weight: bold"'}</span>);
                  <br />
                  {'    '}console.log(desc.sdp);
                  <br />
                  {'  }'}
                  <br />
                  {'  '}<span className="text-white">return</span> _orig.apply(<span className="text-white">this</span>, arguments);
                  <br />
                  {'}'};
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── Example Gallery ───────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              See it in action
            </h3>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {EXAMPLES.map((ex, i) => (
              <div
                key={i}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-black p-6 transition-colors hover:border-white/50"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${ex.dot} shadow-[0_0_12px_rgba(0,0,0,0.5)]`} />
                    <h4 className="text-sm font-semibold text-white">
                      {ex.title}
                    </h4>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {ex.subtitle}
                  </p>
                </div>
                <div className="mt-8">
                  <Link
                    href={`/compare?example=${ex.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white underline transition-colors hover:text-white/80"
                  >
                    Open example &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/50">
        MIT licensed &middot; Open source &middot; Built for WebRTC developers
      </footer>
    </div>
  );
}
