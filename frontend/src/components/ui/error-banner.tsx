import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  message: string;
  hint?: string;
  className?: string;
}

export function ErrorBanner({ message, hint, className }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md border border-red-900/50 bg-red-950/30 p-4 text-red-300',
        className,
      )}
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">{message}</p>
        {hint && <p className="text-sm text-red-400/80 mt-1">{hint}</p>}
      </div>
    </div>
  );
}
