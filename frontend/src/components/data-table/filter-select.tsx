import { cn } from '@/lib/utils';

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function FilterSelect({ label, value, options, onChange, className }: FilterSelectProps) {
  return (
    <label className={cn('flex flex-col gap-1 min-w-[140px]', className)}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-zinc-900">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
