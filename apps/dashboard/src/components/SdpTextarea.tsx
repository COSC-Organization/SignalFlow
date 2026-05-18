import type { SDPSource } from '@signalflow/shared';
import { BrowserBadge } from './BrowserBadge';

interface SdpTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  source?: SDPSource;
}

export function SdpTextarea({
  label,
  value,
  onChange,
  error,
  source,
}: SdpTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-zinc-200">{label}</label>
        {source && <BrowserBadge source={source} />}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste SDP here..."
        spellCheck={false}
        className={`min-h-[200px] w-full resize-y rounded-lg border bg-zinc-900/60 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 ${
          error
            ? 'border-red-500/60 focus:ring-red-500/40'
            : 'border-zinc-700/60 hover:border-zinc-600'
        }`}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
