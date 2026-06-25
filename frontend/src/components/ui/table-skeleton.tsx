import { TableCell, TableRow } from '@/components/ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns: number;
  lastColumnAction?: boolean;
}

/** Skeleton rows matching the final table shape, used while data is loading. */
export function TableSkeleton({ rows = 6, columns, lastColumnAction }: TableSkeletonProps) {
  const textColumns = lastColumnAction ? columns - 1 : columns;
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-white/10">
          {Array.from({ length: textColumns }).map((__, j) => (
            <TableCell key={j}>
              <div
                className="h-4 rounded bg-zinc-800/80 animate-pulse"
                style={{ width: `${55 + ((i + j) % 4) * 12}%` }}
              />
            </TableCell>
          ))}
          {lastColumnAction && (
            <TableCell>
              <div className="h-7 w-20 rounded bg-zinc-800/80 animate-pulse" />
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  );
}
