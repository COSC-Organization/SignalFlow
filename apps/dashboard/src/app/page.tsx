'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    dot: 'bg-semantic-error',
    slug: 'missing-turn',
  },
  {
    title: 'Chrome → Safari codec gap',
    subtitle: "AV1 offered but Safari can't accept it",
    dot: 'bg-yellow-500', // Keeps standard yellow
    slug: 'chrome-safari',
  },
  {
    title: 'Simulcast RID mismatch',
    subtitle: 'SFU silently drops video layers',
    dot: 'bg-semantic-error',
    slug: 'simulcast-broken',
  },
  {
    title: 'Healthy negotiation',
    subtitle: 'What a working offer/answer looks like',
    dot: 'bg-semantic-success',
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
    <div className="flex flex-1 flex-col w-full">
      {/* ── Top Nav ──────────────────────────────────────────────── */}
      <header className="h-[64px] border-b border-hairline bg-canvas flex items-center">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-strong">
              <span className="text-xs font-bold uppercase tracking-wider text-ink">SF</span>
            </div>
            <h1 className="text-base font-medium tracking-tight text-ink font-sans">
              SignalFlow
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/compare"
              className="inline-flex h-10 items-center justify-center rounded-pill bg-primary px-5 py-[10px] text-[15px] font-medium leading-none text-on-primary transition-colors hover:bg-primary-active"
            >
              Launch app
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero Band ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-canvas px-6 py-[96px] text-center">
          {/* Atmospheric Gradient Orbs */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-60 mix-blend-multiply dark:mix-blend-screen blur-[100px]">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,var(--color-gradient-mint),transparent_70%)] opacity-50" />
            <div className="absolute -left-32 -top-32 h-full w-full rounded-full bg-[radial-gradient(circle_at_center,var(--color-gradient-lavender),transparent_70%)] opacity-40" />
          </div>

          <div className="mx-auto max-w-[1200px]">
            <h2 className="mx-auto max-w-4xl text-[48px] sm:text-[64px] font-light leading-[1.05] tracking-[-1.92px] text-ink font-serif">
              Debug WebRTC calls.<br />
              <span className="text-muted">Understand why they fail.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[16px] leading-[1.5] tracking-[0.16px] text-body">
              Paste two SDP strings. Get instant visual diff + plain-English diagnosis of every failure. No developer-tools atmosphere, just clarity.
            </p>
            <div className="mt-12 flex items-center justify-center gap-4">
              <Link
                href="/compare"
                className="inline-flex h-10 items-center justify-center rounded-pill bg-primary px-5 py-[10px] text-[15px] font-medium leading-none text-on-primary transition-colors hover:bg-primary-active"
              >
                Open SDP Diff
              </Link>
              <a
                href="#snippet"
                className="inline-flex h-10 items-center justify-center rounded-pill border border-hairline-strong bg-transparent px-[19px] py-[9px] text-[15px] font-medium leading-none text-ink transition-colors hover:bg-surface-strong"
              >
                Capture SDP
              </a>
            </div>
          </div>
        </section>

        {/* ── Console Snippet ───────────────────────────────────── */}
        <section id="snippet" className="bg-canvas-soft py-[96px]">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-[36px] font-light leading-[1.17] tracking-[-0.36px] text-ink font-serif">
                Capture SDP from any app
              </h3>
              <p className="mt-4 text-[16px] leading-[1.5] tracking-[0.16px] text-body">
                Paste this in browser DevTools on any WebRTC app — Google Meet, your own app, anything.
              </p>
            </div>
            
            <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-xl border border-hairline bg-surface-card p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-pill bg-surface-strong px-[10px] py-[4px] text-[12px] font-semibold uppercase tracking-[0.96px] text-ink">
                  devtools.js
                </span>
                <button
                  onClick={handleCopy}
                  className="rounded-pill border border-hairline bg-transparent px-[19px] py-[9px] text-[15px] font-medium text-ink transition hover:bg-surface-strong"
                >
                  {copied ? 'Copied!' : 'Copy snippet'}
                </button>
              </div>
              <div className="overflow-x-auto rounded-md bg-canvas-soft p-4 border border-hairline">
                <pre className="font-mono text-[14px] leading-relaxed text-ink">
                  <span className="text-primary font-semibold">const</span> _orig = RTCPeerConnection.prototype.setLocalDescription;
                  <br />
                  RTCPeerConnection.prototype.setLocalDescription = <span className="text-primary font-semibold">function</span>(desc) {'{'}
                  <br />
                  {'  '}<span className="text-primary font-semibold">if</span> (desc?.sdp) {'{'}
                  <br />
                  {'    '}console.log(<span className="text-semantic-success">{'"%c[SignalFlow] "'}</span> + desc.type.toUpperCase(), <span className="text-semantic-success">{'"color: #34d399; font-weight: bold"'}</span>);
                  <br />
                  {'    '}console.log(desc.sdp);
                  <br />
                  {'  }'}
                  <br />
                  {'  '}<span className="text-primary font-semibold">return</span> _orig.apply(<span className="text-primary font-semibold">this</span>, arguments);
                  <br />
                  {'}'};
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── Example Gallery ───────────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-6 py-[96px]">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-[36px] font-light leading-[1.17] tracking-[-0.36px] text-ink font-serif">
              See it in action
            </h3>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMPLES.map((ex, i) => (
              <div
                key={i}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-hairline bg-surface-card p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all hover:border-hairline-strong hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${ex.dot}`} />
                    <h4 className="text-[20px] font-medium leading-[1.35] text-ink">
                      {ex.title}
                    </h4>
                  </div>
                  <p className="mt-3 text-[16px] leading-[1.5] tracking-[0.16px] text-body">
                    {ex.subtitle}
                  </p>
                </div>
                <div className="mt-8">
                  <Link
                    href={`/compare?example=${ex.slug}`}
                    className="inline-flex items-center gap-2 text-[15px] font-medium text-ink transition-colors hover:text-primary-active underline decoration-hairline-strong underline-offset-4 hover:decoration-ink"
                  >
                    Open example
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-canvas px-[48px] py-[64px] text-center">
        <p className="text-[15px] leading-[1.47] tracking-[0.15px] text-body">
          MIT licensed &middot; Open source &middot; Built for WebRTC developers
        </p>
      </footer>
    </div>
  );
}
