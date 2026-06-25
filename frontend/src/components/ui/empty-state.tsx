import { type LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-16 text-center', className)}>
      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
        <Icon className="w-5 h-5 text-emerald-400/70" />
      </div>
      <p className="text-zinc-300 font-medium">{title}</p>
      {description && <p className="text-zinc-500 text-sm max-w-sm">{description}</p>}
    </div>
  );
}
