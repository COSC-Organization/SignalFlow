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
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <label className="text-[16px] font-medium text-ink">{label}</label>
        {source && <BrowserBadge source={source} />}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste SDP here..."
        spellCheck={false}
        className={`min-h-[240px] w-full resize-y rounded-md border bg-canvas-soft px-4 py-3 font-mono text-[14px] leading-relaxed text-ink placeholder:text-muted-soft outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
          error
            ? 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error/20'
            : 'border-hairline-strong hover:border-ink focus:border-ink'
        }`}
      />

      {/* Error message */}
      {error && (
        <p className="text-[14px] text-semantic-error mt-1">{error}</p>
      )}
    </div>
  );
}
