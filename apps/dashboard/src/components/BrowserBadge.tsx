import type { SDPSource } from '@signalflow/shared';

const sourceColors: Record<SDPSource, { bg: string; text: string }> = {
  Chrome:    { bg: 'bg-blue-500/20',   text: 'text-blue-300' },
  Firefox:   { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  Safari:    { bg: 'bg-zinc-500/20',   text: 'text-zinc-300' },
  LiveKit:   { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  'Daily.co':{ bg: 'bg-indigo-500/20', text: 'text-indigo-300' },
  mediasoup: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  Pion:      { bg: 'bg-cyan-500/20',   text: 'text-cyan-300' },
  Janus:     { bg: 'bg-emerald-500/20',text: 'text-emerald-300' },
  Unknown:   { bg: 'bg-zinc-700/40',   text: 'text-zinc-400' },
};

interface BrowserBadgeProps {
  source: SDPSource;
}

export function BrowserBadge({ source }: BrowserBadgeProps) {
  const { bg, text } = sourceColors[source] ?? sourceColors.Unknown;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono ${bg} ${text}`}
    >
      {source}
    </span>
  );
}
