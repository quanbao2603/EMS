'use client';

import { Search, RotateCcw, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterSelect, type FilterSelectOption } from './filter-select';
import { cn } from '@/lib/utils';
import type { SortDirection } from '@/lib/list-utils';

export interface ToolbarFilter {
  key: string;
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
}

export interface ToolbarSortOption {
  key: string;
  label: string;
}

interface SearchFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
  sortKey?: string;
  sortOptions?: ToolbarSortOption[];
  onSortKeyChange?: (key: string) => void;
  sortDirection?: SortDirection;
  onToggleSortDirection?: () => void;
  onReset?: () => void;
  totalFiltered: number;
  totalItems: number;
  from: number;
  to: number;
  className?: string;
}

export function SearchFilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters = [],
  sortKey,
  sortOptions = [],
  onSortKeyChange,
  sortDirection = 'desc',
  onToggleSortDirection,
  onReset,
  totalFiltered,
  totalItems,
  from,
  to,
  className,
}: SearchFilterToolbarProps) {
  const hasActiveFilters =
    Boolean(search.trim()) ||
    filters.some((filter) => filter.value && filter.value !== 'all');

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-col gap-1 flex-1 min-w-[220px] max-w-xl">
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Tìm kiếm</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-9 bg-zinc-950/60 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/40"
              />
            </div>
          </label>

          {filters.map((filter) => (
            <FilterSelect
              key={filter.key}
              label={filter.label}
              value={filter.value}
              options={filter.options}
              onChange={filter.onChange}
            />
          ))}

          {sortOptions.length > 0 && onSortKeyChange && (
            <div className="flex items-end gap-2">
              <FilterSelect
                label="Sắp xếp"
                value={sortKey || sortOptions[0].key}
                options={sortOptions.map((option) => ({ value: option.key, label: option.label }))}
                onChange={onSortKeyChange}
              />
              {onToggleSortDirection && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onToggleSortDirection}
                  className="h-9 border-white/10 text-zinc-300 hover:bg-zinc-800/80"
                  title={sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="sr-only">Đổi chiều sắp xếp</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {onReset && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="h-9 border-white/10 text-zinc-300 hover:bg-zinc-800/80 shrink-0"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        {totalFiltered === 0
          ? `Không có bản ghi phù hợp trong tổng ${totalItems}`
          : `Hiển thị ${from}–${to} trong ${totalFiltered} bản ghi${totalFiltered !== totalItems ? ` (lọc từ ${totalItems})` : ''}`}
      </p>
    </div>
  );
}
