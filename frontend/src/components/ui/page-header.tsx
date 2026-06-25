import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { accentIconBox } from '@/lib/ui-classes';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  eyebrow?: string;
}

export function PageHeader({ title, description, icon: Icon, actions, className, eyebrow }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn('hidden sm:flex w-10 h-10 shrink-0', accentIconBox)}>
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-400/75 mb-1.5">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-emerald-500 sm:hidden" />}
            {title}
          </h1>
          {description && <p className="text-zinc-400 mt-1 text-sm max-w-2xl leading-relaxed">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
