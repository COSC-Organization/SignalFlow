import type { SDPSource } from '@signalflow/shared';

const sourceColors: Record<SDPSource, { bg: string; text: string }> = {
  Chrome:    { bg: 'bg-white/10 border border-white/20',   text: 'text-white' },
  Firefox:   { bg: 'bg-white/10 border border-white/20', text: 'text-white' },
  Safari:    { bg: 'bg-white/10 border border-white/20',   text: 'text-white' },
  LiveKit:   { bg: 'bg-white/10 border border-white/20', text: 'text-white' },
  'Daily.co':{ bg: 'bg-white/10 border border-white/20', text: 'text-white' },
  mediasoup: { bg: 'bg-white/10 border border-white/20', text: 'text-white' },
  Pion:      { bg: 'bg-white/10 border border-white/20',   text: 'text-white' },
  Janus:     { bg: 'bg-white/10 border border-white/20',text: 'text-white' },
  Unknown:   { bg: 'bg-white/5 border border-white/10',   text: 'text-white/50' },
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
