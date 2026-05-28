import type { DiagnosticIssue } from '@signalflow/shared';

const severityConfig = {
  error:   { border: 'border-l-red-500',    badge: 'bg-red-500/20 text-red-300',    label: 'errors' },
  warning: { border: 'border-l-yellow-500',  badge: 'bg-yellow-500/20 text-yellow-300', label: 'warnings' },
  info:    { border: 'border-l-blue-500',    badge: 'bg-blue-500/20 text-blue-300',  label: 'info' },
} as const;

const severityOrder: Array<'error' | 'warning' | 'info'> = ['error', 'warning', 'info'];

interface IssuesPanelProps {
  issues: DiagnosticIssue[];
}

export function IssuesPanel({ issues }: IssuesPanelProps) {
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-white/20 bg-black px-4 py-3">
        <p className="text-sm font-medium text-white">
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
    <div className="flex flex-col gap-3">
      {/* Summary badges */}
      <div className="flex items-center gap-2 text-xs">
        {severityOrder.map((sev) =>
          counts[sev] > 0 ? (
            <span
              key={sev}
              className={`inline-flex items-center rounded px-2 py-0.5 font-medium ${severityConfig[sev].badge}`}
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
            className={`rounded-lg border border-white/20 bg-black pl-0 ${cfg.border} border-l-4`}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-bold text-white">{issue.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                {issue.explanation}
              </p>
              <p className="mt-2 text-sm text-white">
                <span className="font-semibold text-white">Fix: </span>
                {issue.fix}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
