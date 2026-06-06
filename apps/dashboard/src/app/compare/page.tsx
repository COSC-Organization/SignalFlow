'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
import { ThemeToggle } from '@/components/ThemeToggle';

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
    const exampleSlug = searchParams.get('example');
    if (exampleSlug && EXAMPLES_BY_SLUG[exampleSlug]) {
      const ex = EXAMPLES_BY_SLUG[exampleSlug];
      setTimeout(() => {
        setSdp1Raw(ex.sdp1);
        setSdp2Raw(ex.sdp2);
        runCompare(ex.sdp1, ex.sdp2);
      }, 0);
      return;
    }

    const saved = loadFromHash();
    if (saved) {
      setTimeout(() => {
        setSdp1Raw(saved.sdp1);
        setSdp2Raw(saved.sdp2);
        runCompare(saved.sdp1, saved.sdp2);
      }, 0);
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
    <div className="flex flex-1 flex-col w-full">
      {/* ── Top Nav ──────────────────────────────────────────────── */}
      <header className="h-[64px] border-b border-hairline bg-canvas flex items-center">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-strong group-hover:bg-surface-dark transition-colors group-hover:text-on-dark">
              <span className="text-xs font-bold uppercase tracking-wider">SF</span>
            </div>
            <h1 className="text-base font-medium tracking-tight text-ink font-sans">
              SignalFlow
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-[48px]">
        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="mb-12">
          <h2 className="text-[36px] font-light tracking-[-0.36px] text-ink font-serif mb-2">
            SDP Diff
          </h2>
          <p className="text-[16px] text-body">
            Paste two SDPs. See what changed. Understand why.
          </p>
        </div>

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
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => runCompare(sdp1Raw, sdp2Raw)}
            disabled={isComparing || !sdp1Raw.trim() || !sdp2Raw.trim()}
            className="inline-flex h-[40px] items-center gap-2 rounded-pill bg-primary px-[20px] py-[10px] text-[15px] font-medium leading-none text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isComparing && <Spinner />}
            {isComparing ? 'Comparing…' : 'Compare'}
          </button>

          {result && (
            <div className="flex items-center">
              <ShareButton />
            </div>
          )}

          {/* Summary counts */}
          {result && (
            <div className="flex items-center gap-2 text-xs">
              {errorCount > 0 && (
                <span className="rounded-pill bg-semantic-error/10 px-2.5 py-1 font-semibold uppercase tracking-[0.96px] text-semantic-error">
                  {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                </span>
              )}
              {warningCount > 0 && (
                <span className="rounded-pill bg-yellow-500/10 px-2.5 py-1 font-semibold uppercase tracking-[0.96px] text-yellow-600 dark:text-yellow-500">
                  {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
                </span>
              )}
              {infoCount > 0 && (
                <span className="rounded-pill bg-blue-500/10 px-2.5 py-1 font-semibold uppercase tracking-[0.96px] text-blue-600 dark:text-blue-400">
                  {infoCount} info
                </span>
              )}
            </div>
          )}

          {/* Browser badges */}
          {result && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.96px] text-muted">Detected:</span>
              <BrowserBadge source={result.parsed1.source} />
              <span className="text-xs text-muted-soft">→</span>
              <BrowserBadge source={result.parsed2.source} />
            </div>
          )}
        </div>

        {/* ── Results ───────────────────────────────────────────── */}
        {result && (
          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {/* Diff view — 2 columns */}
            <div className="xl:col-span-2">
              <h2 className="mb-4 text-[20px] font-medium text-ink flex items-center gap-2">
                Diff
                {result.diff.items.length > 0 && (
                  <span className="inline-flex h-[24px] min-w-[24px] items-center justify-center rounded-pill bg-surface-strong px-2 text-[12px] font-semibold text-ink">
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
              <h2 className="mb-4 text-[20px] font-medium text-ink flex items-center gap-2">
                Diagnostics
                {result.issues.length > 0 && (
                  <span className="inline-flex h-[24px] min-w-[24px] items-center justify-center rounded-pill bg-semantic-error/10 px-2 text-[12px] font-semibold text-semantic-error">
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
          <div className="mt-24 flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-strong">
              <span className="text-2xl">🔍</span>
            </div>
            <h2 className="text-[24px] font-light text-ink font-serif mt-2">
              Compare two SDPs
            </h2>
            <p className="max-w-md text-[16px] leading-[1.5] text-body">
              Paste an Offer on the left and an Answer on the right. SignalFlow
              will show a semantic diff, detect the source browser or SFU, and
              run diagnostic rules.
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-hairline py-8">
        <p className="text-center text-[15px] text-body">
          SignalFlow — Open-source WebRTC SDP debugger
        </p>
      </footer>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <ComparePageInner />
    </Suspense>
  );
}
