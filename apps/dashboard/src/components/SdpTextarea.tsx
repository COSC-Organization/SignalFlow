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
        <label className="text-sm font-medium text-white">{label}</label>
        {source && <BrowserBadge source={source} />}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste SDP here..."
        spellCheck={false}
        className={`min-h-[200px] w-full resize-y rounded-lg border bg-black px-3 py-2 font-mono text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:ring-2 focus:ring-white/40 ${
          error
            ? 'border-red-500/60 focus:ring-red-500/40'
            : 'border-white/20 hover:border-white/50'
        }`}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
