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
  added:     { pill: 'bg-ink text-canvas font-semibold',  label: 'added' },
  removed:   { pill: 'bg-surface-strong text-muted',      label: 'removed' },
  changed:   { pill: 'bg-primary text-on-primary font-semibold',  label: 'changed' },
  unchanged: { pill: 'bg-transparent text-muted-soft',    label: 'same' },
};

const severityBorder: Record<string, string> = {
  error:   'border-l-semantic-error',
  warning: 'border-l-yellow-500',
  info:    'border-l-blue-500',
  ok:      'border-l-transparent',
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
    <span className={`inline-flex items-center justify-center rounded px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.96px] ${cfg.pill}`}>
      {cfg.label}
    </span>
  );
}

function DiffTable({ items }: { items: DiffItem[] }) {
  return (
    <table className="w-full text-[14px]">
      <thead>
        <tr className="border-b border-hairline text-left text-muted font-medium">
          <th className="w-[30%] py-2 pr-3 font-medium">Field</th>
          <th className="w-[28%] py-2 pr-3 font-medium">Before</th>
          <th className="w-[28%] py-2 pr-3 font-medium">After</th>
          <th className="w-[14%] py-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr
            key={`${item.path}-${i}`}
            className="border-b border-hairline-soft last:border-b-0"
          >
            {/* Field */}
            <td className="py-2.5 pr-3">
              <span
                className="block max-w-[200px] truncate font-mono text-ink"
                title={item.label}
              >
                {item.label}
              </span>
            </td>

            {/* Before */}
            <td className="py-2.5 pr-3">
              {item.valueBefore ? (
                <span
                  className={`block max-w-[200px] truncate font-mono ${
                    item.type === 'removed' || item.type === 'changed'
                      ? 'text-muted line-through'
                      : 'text-body'
                  }`}
                  title={item.valueBefore}
                >
                  {item.valueBefore}
                </span>
              ) : (
                <span className="text-muted-soft">—</span>
              )}
            </td>

            {/* After */}
            <td className="py-2.5 pr-3">
              {item.valueAfter ? (
                <span
                  className={`block max-w-[200px] truncate font-mono ${
                    item.type === 'added' || item.type === 'changed'
                      ? 'text-ink font-medium'
                      : 'text-body'
                  }`}
                  title={item.valueAfter}
                >
                  {item.valueAfter}
                </span>
              ) : (
                <span className="text-muted-soft">—</span>
              )}
            </td>

            {/* Type badge */}
            <td className="py-2.5">
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
    <div className={`rounded-xl border border-hairline bg-surface-card border-l-4 ${borderClass} overflow-hidden shadow-sm`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-strong"
      >
        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        <span className="text-[12px] font-semibold uppercase tracking-[0.96px] text-ink">
          {title}
        </span>

        {subtitle && (
          <span className="text-[14px] text-muted">{subtitle}</span>
        )}

        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-surface-strong px-2 text-[10px] font-bold text-ink">
          {itemCount}
        </span>
      </button>

      {open && (
        <div className="border-t border-hairline px-5 py-3">
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
      <div className="rounded-xl border border-hairline bg-surface-card px-5 py-4 shadow-sm">
        <p className="text-[15px] font-medium text-ink">
          ✓ No differences found between these two SDPs
        </p>
      </div>
    );
  }

  // ── Summary bar ───────────────────────────────────────────────
  const { summary } = diff;

  const mediaPaths = new Set(
    diff.mediaChanges.flatMap((mc) => mc.items.map((i) => `${i.path}|${i.label}`)),
  );
  const sessionItems = diff.items.filter(
    (i) => !mediaPaths.has(`${i.path}|${i.label}`),
  );

  void parsed1;
  void parsed2;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Summary badges ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        {summary.changes > 0 && (
          <span className="rounded-pill bg-surface-strong px-3 py-1 font-medium text-ink">
            {summary.changes} changed
          </span>
        )}
        {summary.additions > 0 && (
          <span className="rounded-pill bg-surface-strong px-3 py-1 font-medium text-ink">
            {summary.additions} added
          </span>
        )}
        {summary.removals > 0 && (
          <span className="rounded-pill bg-surface-strong px-3 py-1 font-medium text-muted">
            {summary.removals} removed
          </span>
        )}
        {summary.errors > 0 && (
          <span className="rounded-pill bg-semantic-error/10 px-3 py-1 font-semibold text-semantic-error">
            {summary.errors} {summary.errors === 1 ? 'error' : 'errors'}
          </span>
        )}
        {summary.warnings > 0 && (
          <span className="rounded-pill bg-yellow-500/10 px-3 py-1 font-semibold text-yellow-600 dark:text-yellow-500">
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
