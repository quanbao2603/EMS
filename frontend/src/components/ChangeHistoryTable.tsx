'use client';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { DataTableCard, DataTableScroll } from '@/components/data-table/data-table-card';
import { SearchFilterToolbar } from '@/components/data-table/search-filter-toolbar';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { useClientListTable } from '@/hooks/useClientListTable';
import { compareStrings, matchesFields } from '@/lib/list-utils';
import { type ChangeHistoryItem } from '@/hooks/useChangeHistory';
import { FileSearch } from 'lucide-react';

const currency = (v: string | null | undefined) =>
  v ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v)) : '-';

interface ChangeHistoryTableProps {
  history: ChangeHistoryItem[];
  loading: boolean;
}

export function ChangeHistoryTable({ history, loading }: ChangeHistoryTableProps) {
  const list = useClientListTable({
    items: history,
    defaultSortKey: 'timestamp',
    defaultSortDirection: 'desc',
    defaultFilters: { eventType: 'all' },
    searchMatcher: (item, query) =>
      matchesFields([
        item.maNV,
        item.performedBy,
        item.changeSummary,
        item.eventType === 'EDIT_SALARY' ? 'lương' : 'thông tin cá nhân',
      ], query),
    filterMatcher: (item, filters) =>
      filters.eventType === 'all' || item.eventType === filters.eventType,
    sortOptions: [
      { key: 'timestamp', label: 'Thời gian', compare: (a, b) => compareStrings(a.timestamp, b.timestamp, 'asc') },
      { key: 'maNV', label: 'Mã NV', compare: (a, b) => compareStrings(a.maNV ?? '', b.maNV ?? '', 'asc') },
      { key: 'performedBy', label: 'Người thực hiện', compare: (a, b) => compareStrings(a.performedBy, b.performedBy, 'asc') },
    ],
  });

  return (
    <DataTableCard
      toolbar={
        <SearchFilterToolbar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Tìm mã NV, người thực hiện, nội dung thay đổi..."
          filters={[{
            key: 'eventType',
            label: 'Loại',
            value: list.filters.eventType,
            onChange: (v) => list.setFilter('eventType', v),
            options: [
              { value: 'all', label: 'Tất cả' },
              { value: 'EDIT_INFO', label: 'Thông tin cá nhân' },
              { value: 'EDIT_SALARY', label: 'Lương' },
            ],
          }]}
          sortKey={list.sortKey}
          onSortKeyChange={list.setSortKey}
          sortOptions={[
            { key: 'timestamp', label: 'Thời gian' },
            { key: 'maNV', label: 'Mã NV' },
            { key: 'performedBy', label: 'Người thực hiện' },
          ]}
          sortDirection={list.sortDirection}
          onToggleSortDirection={list.toggleSortDirection}
          onReset={list.resetFilters}
          totalFiltered={list.totalFiltered}
          totalItems={history.length}
          from={list.from}
          to={list.to}
        />
      }
      pagination={
        list.totalFiltered > 0 ? (
          <PaginationControls
            page={list.page}
            totalPages={list.totalPages}
            pageSize={list.pageSize}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        ) : null
      }
    >
      <DataTableScroll>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider w-[170px]">Thời gian</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Mã NV</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider hidden sm:table-cell">Người thực hiện</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Loại</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Nội dung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={6} columns={5} />
            ) : list.totalFiltered === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={FileSearch}
                    title={history.length === 0 ? 'Chưa có lịch sử thay đổi' : 'Không tìm thấy bản ghi phù hợp'}
                  />
                </TableCell>
              </TableRow>
            ) : (
              list.paginatedItems.map((item, idx) => (
                <TableRow key={`${item.timestamp}-${item.maNV}-${idx}`} className="border-white/10 hover:bg-zinc-800/40">
                  <TableCell className="text-zinc-400 font-mono text-xs tabular-nums whitespace-nowrap">
                    {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-zinc-200">{item.maNV || '-'}</TableCell>
                  <TableCell className="text-zinc-300 text-sm hidden sm:table-cell">{item.performedBy}</TableCell>
                  <TableCell>
                    {item.eventType === 'EDIT_SALARY' ? (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/25">Lương</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">Thông tin</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm">
                    {item.eventType === 'EDIT_SALARY' ? (
                      <span>
                        <span className="line-through text-zinc-500">{currency(item.oldValue)}</span>
                        {' → '}
                        <span className="text-emerald-400 font-medium">{currency(item.newValue)}</span>
                      </span>
                    ) : (
                      item.changeSummary
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableScroll>
    </DataTableCard>
  );
}
