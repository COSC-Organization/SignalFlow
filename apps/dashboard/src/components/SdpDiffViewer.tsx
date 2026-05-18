'use client';

import { useState } from 'react';
import type {
  ParsedSDP,
  SDPDiffResult,
  DiffItem,
  DiffType,
  MediaDiffSection,
} from '@signalflow/shared';

// ── Helpers ─────────────────────────────────────────────────────────

const typeConfig: Record<
  DiffType,
  { pill: string; label: string }
> = {
  added:     { pill: 'bg-green-500/20 text-green-300',  label: 'added' },
  removed:   { pill: 'bg-red-500/20 text-red-300',      label: 'removed' },
  changed:   { pill: 'bg-amber-500/20 text-amber-300',  label: 'changed' },
  unchanged: { pill: 'bg-zinc-700/30 text-zinc-500',    label: 'same' },
};

const severityBorder: Record<string, string> = {
  error:   'border-l-red-500',
  warning: 'border-l-yellow-500',
  info:    'border-l-blue-500',
  ok:      'border-l-zinc-700',
};

/** Determine the worst severity present in a set of diff items. */
function worstSeverity(items: DiffItem[]): 'error' | 'warning' | 'info' | 'ok' {
  const order = ['error', 'warning', 'info', 'ok'] as const;
  for (const s of order) {
    if (items.some((i) => i.severity === s)) return s;
  }
  return 'ok';
}

/** Media type label for the section header. */
function mediaTypeLabel(type: string): string {
  switch (type) {
    case 'audio':       return 'AUDIO';
    case 'video':       return 'VIDEO';
    case 'application': return 'DATA';
    default:            return type.toUpperCase();
  }
}

// ── Sub-components ──────────────────────────────────────────────────

function TypeBadge({ type }: { type: DiffType }) {
  const cfg = typeConfig[type];
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.pill}`}>
      {cfg.label}
    </span>
  );
}

function DiffTable({ items }: { items: DiffItem[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-zinc-800 text-left text-zinc-500">
          <th className="w-[30%] py-1.5 pr-3 font-medium">Field</th>
          <th className="w-[28%] py-1.5 pr-3 font-medium">Before</th>
          <th className="w-[28%] py-1.5 pr-3 font-medium">After</th>
          <th className="w-[14%] py-1.5 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr
            key={`${item.path}-${i}`}
            className="border-b border-zinc-800/50 last:border-b-0"
          >
            {/* Field */}
            <td className="py-1.5 pr-3">
              <span
                className="block max-w-[200px] truncate font-mono text-zinc-300"
                title={item.label}
              >
                {item.label}
              </span>
            </td>

            {/* Before */}
            <td className="py-1.5 pr-3">
              {item.valueBefore ? (
                <span
                  className={`block max-w-[200px] truncate font-mono ${
                    item.type === 'removed' || item.type === 'changed'
                      ? 'text-red-400'
                      : 'text-zinc-500'
                  }`}
                  title={item.valueBefore}
                >
                  {item.valueBefore}
                </span>
              ) : (
                <span className="text-zinc-700">—</span>
              )}
            </td>

            {/* After */}
            <td className="py-1.5 pr-3">
              {item.valueAfter ? (
                <span
                  className={`block max-w-[200px] truncate font-mono ${
                    item.type === 'added' || item.type === 'changed'
                      ? 'text-green-400'
                      : 'text-zinc-500'
                  }`}
                  title={item.valueAfter}
                >
                  {item.valueAfter}
                </span>
              ) : (
                <span className="text-zinc-700">—</span>
              )}
            </td>

            {/* Type badge */}
            <td className="py-1.5">
              <TypeBadge type={item.type} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  borderClass,
  itemCount,
  defaultOpen,
  children,
}: {
  title: string;
  subtitle?: string;
  borderClass: string;
  itemCount: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-lg border border-zinc-800 bg-zinc-900/40 border-l-4 ${borderClass} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-zinc-800/30"
      >
        {/* Chevron */}
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
          {title}
        </span>

        {subtitle && (
          <span className="text-xs text-zinc-500">{subtitle}</span>
        )}

        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-700/60 px-1.5 text-[10px] font-semibold text-zinc-400">
          {itemCount}
        </span>
      </button>

      {open && (
        <div className="border-t border-zinc-800/60 px-4 py-2">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────

interface SdpDiffViewerProps {
  diff: SDPDiffResult;
  parsed1: ParsedSDP;
  parsed2: ParsedSDP;
}

export function SdpDiffViewer({ diff, parsed1, parsed2 }: SdpDiffViewerProps) {
  // ── Empty state ───────────────────────────────────────────────
  if (diff.items.length === 0) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
        <p className="text-sm font-medium text-green-400">
          ✓ No differences found between these two SDPs
        </p>
      </div>
    );
  }

  // ── Summary bar ───────────────────────────────────────────────
  const { summary } = diff;

  // ── Split items into session-level vs media-level ─────────────
  // Items whose path starts with "media[" belong to a media section;
  // everything else is session-level.
  const mediaPaths = new Set(
    diff.mediaChanges.flatMap((mc) => mc.items.map((i) => `${i.path}|${i.label}`)),
  );
  const sessionItems = diff.items.filter(
    (i) => !mediaPaths.has(`${i.path}|${i.label}`),
  );

  // Suppress the parsed1/parsed2 props from triggering unused-var warnings
  // They're kept in the API for future use (e.g. rendering raw SDP snippets)
  void parsed1;
  void parsed2;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Summary badges ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {summary.changes > 0 && (
          <span className="rounded bg-amber-500/20 px-2 py-0.5 font-medium text-amber-300">
            {summary.changes} changed
          </span>
        )}
        {summary.additions > 0 && (
          <span className="rounded bg-green-500/20 px-2 py-0.5 font-medium text-green-300">
            {summary.additions} added
          </span>
        )}
        {summary.removals > 0 && (
          <span className="rounded bg-red-500/20 px-2 py-0.5 font-medium text-red-300">
            {summary.removals} removed
          </span>
        )}
        {summary.errors > 0 && (
          <span className="rounded bg-red-500/15 px-2 py-0.5 font-medium text-red-400">
            {summary.errors} {summary.errors === 1 ? 'error' : 'errors'}
          </span>
        )}
        {summary.warnings > 0 && (
          <span className="rounded bg-yellow-500/15 px-2 py-0.5 font-medium text-yellow-400">
            {summary.warnings} {summary.warnings === 1 ? 'warning' : 'warnings'}
          </span>
        )}
      </div>

      {/* ── Session-level section ────────────────────────────────── */}
      {sessionItems.length > 0 && (
        <CollapsibleSection
          title="Session"
          borderClass={severityBorder[worstSeverity(sessionItems)]}
          itemCount={sessionItems.length}
          defaultOpen={sessionItems.some((i) => i.severity === 'error')}
        >
          <DiffTable items={sessionItems} />
        </CollapsibleSection>
      )}

      {/* ── Per-media sections ───────────────────────────────────── */}
      {diff.mediaChanges.map((mc) => {
        const worst = worstSeverity(mc.items);
        return (
          <CollapsibleSection
            key={mc.mid}
            title={mediaTypeLabel(mc.type)}
            subtitle={`mid=${mc.mid}`}
            borderClass={severityBorder[worst]}
            itemCount={mc.items.length}
            defaultOpen={worst === 'error'}
          >
            <DiffTable items={mc.items} />
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
