import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { glassPanel } from '@/lib/ui-classes';

export function GlassCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn(glassPanel, 'text-zinc-100 ring-0', className)} {...props} />;
}
