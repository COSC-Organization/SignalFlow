import type { DiagnosticIssue } from '@signalflow/shared';

const severityConfig = {
  error:   { border: 'border-l-semantic-error',    badge: 'bg-semantic-error/10 text-semantic-error',    label: 'errors' },
  warning: { border: 'border-l-yellow-500',  badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500', label: 'warnings' },
  info:    { border: 'border-l-blue-500',    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',  label: 'info' },
} as const;

const severityOrder: Array<'error' | 'warning' | 'info'> = ['error', 'warning', 'info'];

interface IssuesPanelProps {
  issues: DiagnosticIssue[];
}

export function IssuesPanel({ issues }: IssuesPanelProps) {
  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-hairline bg-surface-card px-5 py-4 shadow-sm">
        <p className="text-[15px] font-medium text-ink">
          ✓ No issues detected
        </p>
      </div>
    );
  }

  // Count by severity
  const counts = {
    error:   issues.filter((i) => i.severity === 'error').length,
    warning: issues.filter((i) => i.severity === 'warning').length,
    info:    issues.filter((i) => i.severity === 'info').length,
  };

  // Sort: errors first, then warnings, then info
  const sorted = [...issues].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Summary badges */}
      <div className="flex items-center gap-2 text-[12px]">
        {severityOrder.map((sev) =>
          counts[sev] > 0 ? (
            <span
              key={sev}
              className={`inline-flex items-center rounded-pill px-3 py-1 font-semibold uppercase tracking-[0.96px] ${severityConfig[sev].badge}`}
            >
              {counts[sev]} {severityConfig[sev].label}
            </span>
          ) : null,
        )}
      </div>

      {/* Issue cards */}
      {sorted.map((issue, idx) => {
        const cfg = severityConfig[issue.severity];
        return (
          <div
            key={`${issue.id}-${idx}`}
            className={`rounded-xl border border-hairline bg-surface-card pl-0 ${cfg.border} border-l-4 shadow-sm`}
          >
            <div className="px-5 py-4">
              <p className="text-[16px] font-semibold text-ink">{issue.title}</p>
              <p className="mt-2 text-[15px] leading-[1.5] text-body">
                {issue.explanation}
              </p>
              <div className="mt-3 rounded bg-canvas-soft px-3 py-2 border border-hairline-soft">
                <p className="text-[14px] text-ink">
                  <span className="font-semibold text-ink">Fix: </span>
                  {issue.fix}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
