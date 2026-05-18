'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  parseSDP,
  diffSDPs,
  runDiagnostics,
  type ParsedSDP,
  type SDPDiffResult,
  type DiagnosticIssue,
} from '@signalflow/shared';
import { SdpTextarea } from '@/components/SdpTextarea';
import { SdpDiffViewer } from '@/components/SdpDiffViewer';
import { IssuesPanel } from '@/components/IssuesPanel';
import { ShareButton } from '@/components/ShareButton';
import { BrowserBadge } from '@/components/BrowserBadge';
import { saveToHash, loadFromHash } from '@/lib/share';
import { EXAMPLES_BY_SLUG } from '@/lib/example-sdps';

// ── Types ───────────────────────────────────────────────────────────

interface CompareResult {
  parsed1: ParsedSDP;
  parsed2: ParsedSDP;
  diff: SDPDiffResult;
  issues: DiagnosticIssue[];
}

// ── Spinner ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Page ────────────────────────────────────────────────────────────

function ComparePageInner() {
  const searchParams = useSearchParams();
  const [sdp1Raw, setSdp1Raw] = useState('');
  const [sdp2Raw, setSdp2Raw] = useState('');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Compare logic ───────────────────────────────────────────────

  const runCompare = useCallback((s1: string, s2: string) => {
    if (!s1.trim() || !s2.trim()) {
      setResult(null);
      setError1(null);
      setError2(null);
      return;
    }

    setIsComparing(true);

    let parsed1: ParsedSDP;
    try {
      parsed1 = parseSDP(s1);
      setError1(null);
    } catch (e: unknown) {
      setError1(e instanceof Error ? e.message : String(e));
      setIsComparing(false);
      setResult(null);
      return;
    }

    let parsed2: ParsedSDP;
    try {
      parsed2 = parseSDP(s2);
      setError2(null);
    } catch (e: unknown) {
      setError2(e instanceof Error ? e.message : String(e));
      setIsComparing(false);
      setResult(null);
      return;
    }

    const diff = diffSDPs(parsed1, parsed2);
    const issues = runDiagnostics(parsed1, parsed2);

    setResult({ parsed1, parsed2, diff, issues });
    saveToHash(s1, s2);
    setIsComparing(false);
  }, []);

  // ── Load from query param or URL hash on mount ──────────────────

  useEffect(() => {
    // 1. Check for ?example= query param
    const exampleSlug = searchParams.get('example');
    if (exampleSlug && EXAMPLES_BY_SLUG[exampleSlug]) {
      const ex = EXAMPLES_BY_SLUG[exampleSlug];
      setSdp1Raw(ex.sdp1);
      setSdp2Raw(ex.sdp2);
      runCompare(ex.sdp1, ex.sdp2);
      return;
    }

    // 2. Fall back to URL hash
    const saved = loadFromHash();
    if (saved) {
      setSdp1Raw(saved.sdp1);
      setSdp2Raw(saved.sdp2);
      runCompare(saved.sdp1, saved.sdp2);
    }
  }, [runCompare, searchParams]);

  // ── Debounced auto-compare on text change ───────────────────────

  useEffect(() => {
    if (!sdp1Raw && !sdp2Raw) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      runCompare(sdp1Raw, sdp2Raw);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sdp1Raw, sdp2Raw, runCompare]);

  // ── Derived counts ─────────────────────────────────────────────

  const errorCount = result?.issues.filter((i) => i.severity === 'error').length ?? 0;
  const warningCount = result?.issues.filter((i) => i.severity === 'warning').length ?? 0;
  const infoCount = result?.issues.filter((i) => i.severity === 'info').length ?? 0;

  return (
    <div className="flex min-h-full flex-col" style={{ backgroundColor: '#0d0d0d' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-sm font-bold text-white">SF</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                SDP Diff
              </h1>
              <p className="text-sm text-zinc-500">
                Paste two SDPs. See what changed. Understand why.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {/* ── SDP Input Grid ────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SdpTextarea
            label="Offer SDP"
            value={sdp1Raw}
            onChange={setSdp1Raw}
            error={error1}
            source={result?.parsed1.source}
          />
          <SdpTextarea
            label="Answer SDP"
            value={sdp2Raw}
            onChange={setSdp2Raw}
            error={error2}
            source={result?.parsed2.source}
          />
        </div>

        {/* ── Action row ────────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => runCompare(sdp1Raw, sdp2Raw)}
            disabled={isComparing || !sdp1Raw.trim() || !sdp2Raw.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isComparing && <Spinner />}
            {isComparing ? 'Comparing…' : 'Compare'}
          </button>

          {result && <ShareButton />}

          {/* Summary counts */}
          {result && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {errorCount > 0 && (
                <span className="rounded bg-red-500/20 px-2 py-0.5 font-medium text-red-300">
                  {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                </span>
              )}
              {warningCount > 0 && (
                <span className="rounded bg-yellow-500/20 px-2 py-0.5 font-medium text-yellow-300">
                  {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
                </span>
              )}
              {infoCount > 0 && (
                <span className="rounded bg-blue-500/20 px-2 py-0.5 font-medium text-blue-300">
                  {infoCount} info
                </span>
              )}
            </div>
          )}

          {/* Browser badges */}
          {result && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-zinc-600">Detected:</span>
              <BrowserBadge source={result.parsed1.source} />
              <span className="text-xs text-zinc-700">→</span>
              <BrowserBadge source={result.parsed2.source} />
            </div>
          )}
        </div>

        {/* ── Results ───────────────────────────────────────────── */}
        {result && (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {/* Diff view — 2 columns */}
            <div className="xl:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-zinc-300">
                Diff
                {result.diff.items.length > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-xs font-semibold text-amber-300">
                    {result.diff.items.length}
                  </span>
                )}
              </h2>
              <SdpDiffViewer
                diff={result.diff}
                parsed1={result.parsed1}
                parsed2={result.parsed2}
              />
            </div>

            {/* Issues panel — 1 column */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-zinc-300">
                Diagnostics
                {result.issues.length > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 text-xs font-semibold text-red-300">
                    {result.issues.length}
                  </span>
                )}
              </h2>
              <IssuesPanel issues={result.issues} />
            </div>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────── */}
        {!result && !sdp1Raw && !sdp2Raw && (
          <div className="mt-20 flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50">
              <span className="text-2xl">🔍</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-200">
              Compare two SDPs
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-zinc-500">
              Paste an Offer on the left and an Answer on the right. SignalFlow
              will show a semantic diff, detect the source browser or SFU, and
              run 18 diagnostic rules covering ICE, DTLS, codecs, simulcast,
              and BUNDLE.
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/40 py-4">
        <p className="text-center text-xs text-zinc-600">
          SignalFlow — Open-source WebRTC SDP debugger
        </p>
      </footer>
    </div>
  );
}

// ── Default export with Suspense boundary (required by useSearchParams) ─

export default function ComparePage() {
  return (
    <Suspense>
      <ComparePageInner />
    </Suspense>
  );
}
