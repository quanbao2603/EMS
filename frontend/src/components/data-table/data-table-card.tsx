import { cn } from '@/lib/utils';
import { tableShell } from '@/lib/ui-classes';

interface DataTableCardProps {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  pagination?: React.ReactNode;
  className?: string;
}

export function DataTableCard({ toolbar, children, pagination, className }: DataTableCardProps) {
  return (
    <div className={cn(tableShell, 'flex flex-col', className)}>
      {toolbar && <div className="p-4 border-b border-white/10">{toolbar}</div>}
      <div className={cn('px-4 pt-3', pagination ? 'pb-3' : 'pb-4')}>{children}</div>
      {pagination && (
        <div className="px-4 py-4 border-t border-white/10 bg-zinc-950/20">{pagination}</div>
      )}
    </div>
  );
}

export function DataTableScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto -mx-1 px-1', className)}>
      <div className="max-h-[min(68vh,760px)] overflow-y-auto rounded-lg border border-white/10">
        {children}
      </div>
    </div>
  );
}
