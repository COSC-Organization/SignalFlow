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
    <div className="flex min-h-full flex-col" style={{ backgroundColor: '#0d0d0d' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-sm font-bold text-white">SF</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
              SignalFlow
            </h1>
          </div>
          <Link
            href="/compare"
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
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
            <span className="text-zinc-500">Understand why they fail.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Paste two SDP strings. Get instant visual diff + plain-English diagnosis of every failure.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 font-medium text-white transition-colors hover:bg-blue-500"
            >
              Open SDP Diff &rarr;
            </Link>
          </div>
        </section>

        {/* ── Console Snippet ───────────────────────────────────── */}
        <section className="border-y border-zinc-800/60 bg-zinc-900/30">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-2xl font-bold tracking-tight text-white">
                Capture SDP from any app
              </h3>
              <p className="mt-4 text-zinc-400">
                Paste this in browser DevTools on any WebRTC app — Google Meet, your own app, anything.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-xl border border-zinc-800/80 bg-black/60 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-zinc-500 font-mono">devtools.js</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed text-zinc-300">
                  <span className="text-purple-400">const</span> _orig = RTCPeerConnection.prototype.setLocalDescription;
                  <br />
                  RTCPeerConnection.prototype.setLocalDescription = <span className="text-purple-400">function</span>(desc) {'{'}
                  <br />
                  {'  '}<span className="text-purple-400">if</span> (desc?.sdp) {'{'}
                  <br />
                  {'    '}console.log(<span className="text-green-300">"%c[SignalFlow] "</span> + desc.type.toUpperCase(), <span className="text-green-300">"color: #34d399; font-weight: bold"</span>);
                  <br />
                  {'    '}console.log(desc.sdp);
                  <br />
                  {'  }'}
                  <br />
                  {'  '}<span className="text-purple-400">return</span> _orig.apply(<span className="text-blue-400">this</span>, arguments);
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
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:bg-zinc-900/80 hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${ex.dot} shadow-[0_0_12px_rgba(0,0,0,0.5)]`} />
                    <h4 className="text-sm font-semibold text-zinc-200">
                      {ex.title}
                    </h4>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                    {ex.subtitle}
                  </p>
                </div>
                <div className="mt-8">
                  <Link
                    href={`/compare?example=${ex.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors group-hover:text-blue-300"
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
      <footer className="border-t border-zinc-800/40 py-8 text-center text-sm text-zinc-600">
        MIT licensed &middot; Open source &middot; Built for WebRTC developers
      </footer>
    </div>
  );
}
