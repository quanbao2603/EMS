'use client';

import { useMemo } from 'react';
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
import { compareStrings, matchesFields, uniqueSorted } from '@/lib/list-utils';
import { type UnifiedAuditRow } from '@/lib/merge-audit-logs';
import { FileSearch } from 'lucide-react';

interface AuditMonitoringTableProps {
  rows: UnifiedAuditRow[];
  loading: boolean;
}

function isWarningStatus(status: string | null): boolean {
  if (!status) return false;
  const upper = status.toUpperCase();
  return upper.includes('THẤT BẠI') || upper.includes('CẢNH BÁO') || upper.includes('FAIL');
}

export function AuditMonitoringTable({ rows, loading }: AuditMonitoringTableProps) {
  const statuses = useMemo(() => uniqueSorted(rows.map((r) => r.status).filter(Boolean) as string[]), [rows]);
  const sources = useMemo(() => uniqueSorted(rows.map((r) => r.source)), [rows]);

  const list = useClientListTable({
    items: rows,
    defaultSortKey: 'timestamp',
    defaultSortDirection: 'desc',
    defaultFilters: { status: 'all', source: 'all' },
    searchMatcher: (row, query) =>
      matchesFields([
        row.maNV,
        row.performedBy,
        row.changeSummary,
        row.action,
        row.targetTable,
        row.status,
      ], query),
    filterMatcher: (row, filters) => {
      if (filters.status !== 'all' && row.status !== filters.status) return false;
      if (filters.source !== 'all' && row.source !== filters.source) return false;
      return true;
    },
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
          searchPlaceholder="Tìm mã NV, người thực hiện, nội dung, trạng thái..."
          filters={[
            {
              key: 'source',
              label: 'Nguồn',
              value: list.filters.source,
              onChange: (v) => list.setFilter('source', v),
              options: [
                { value: 'all', label: 'Tất cả' },
                { value: 'fga', label: 'Giám sát FGA' },
                { value: 'system', label: 'Hệ thống' },
              ].filter((opt) => opt.value === 'all' || sources.includes(opt.value)),
            },
            {
              key: 'status',
              label: 'Trạng thái',
              value: list.filters.status,
              onChange: (v) => list.setFilter('status', v),
              options: [{ value: 'all', label: 'Tất cả' }, ...statuses.map((s) => ({ value: s, label: s }))],
            },
          ]}
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
          totalItems={rows.length}
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
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Nội dung thay đổi</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider hidden md:table-cell w-[100px]">Trạng thái</TableHead>
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
                    title={rows.length === 0 ? 'Chưa có bản ghi giám sát' : 'Không tìm thấy bản ghi phù hợp'}
                    description={rows.length === 0 ? 'Hành động chỉnh sửa của nhân viên HR sẽ xuất hiện tại đây.' : undefined}
                  />
                </TableCell>
              </TableRow>
            ) : (
              list.paginatedItems.map((row) => {
                const warn = isWarningStatus(row.status);
                return (
                  <TableRow
                    key={row.id}
                    className={`border-white/10 ${warn ? 'bg-red-950/15 hover:bg-red-950/25' : 'hover:bg-zinc-800/40'}`}
                  >
                    <TableCell className="text-zinc-400 font-mono text-xs tabular-nums whitespace-nowrap">
                      {format(new Date(row.timestamp), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-zinc-200">{row.maNV || '-'}</TableCell>
                    <TableCell className="text-zinc-300 text-sm hidden sm:table-cell">{row.performedBy}</TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      <p>{row.changeSummary}</p>
                      {row.source === 'system' && row.targetTable && (
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono">{row.targetTable}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {row.status ? (
                        <Badge
                          className={
                            warn
                              ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          }
                        >
                          {row.status}
                        </Badge>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DataTableScroll>
    </DataTableCard>
  );
}
