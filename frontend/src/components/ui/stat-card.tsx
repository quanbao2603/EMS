import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { accentIconBox, glassPanelSubtle } from '@/lib/ui-classes';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, className }: StatCardProps) {
  return (
    <div className={cn('flex items-center gap-3 p-4', glassPanelSubtle, className)}>
      <div className={cn('w-9 h-9 shrink-0', accentIconBox)}>
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 truncate">{label}</p>
        <p className="text-lg font-semibold text-zinc-100 font-mono tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}
