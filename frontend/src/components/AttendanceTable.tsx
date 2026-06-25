'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import axiosClient from '@/utils/axiosClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { DataTableCard, DataTableScroll } from '@/components/data-table/data-table-card';
import { SearchFilterToolbar } from '@/components/data-table/search-filter-toolbar';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { useClientListTable } from '@/hooks/useClientListTable';
import { compareStrings, matchesFields, uniqueSorted } from '@/lib/list-utils';
import { CalendarX, CalendarDays, UserCheck } from 'lucide-react';

interface AttendanceRecord {
  maChamCong: string;
  maNV: string;
  ngayLamViec: string;
  trangThai: string;
}

type ApiError = { response?: { data?: { message?: string } } };

const STATUS_STYLES: Record<string, string> = {
  'Co mat': 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  Tre: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  'Vang co phep': 'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  'Vang khong phep': 'bg-red-500/15 text-red-300 border border-red-500/25',
};

const STATUS_LABELS: Record<string, string> = {
  'Co mat': 'Có mặt',
  Tre: 'Đi trễ',
  'Vang co phep': 'Vắng có phép',
  'Vang khong phep': 'Vắng không phép',
};

export function AttendanceTable() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/attendance');
      setRecords(res.data);
    } catch (err: unknown) {
      setError((err as ApiError)?.response?.data?.message || 'Không thể tải dữ liệu chấm công.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchAttendance();
  }, [user, fetchAttendance]);

  const statuses = useMemo(
    () => uniqueSorted(records.map((r) => r.trangThai)),
    [records],
  );

  const list = useClientListTable({
    items: records,
    defaultSortKey: 'ngayLamViec',
    defaultSortDirection: 'desc',
    defaultFilters: { status: 'all' },
    searchMatcher: (rec, query) =>
      matchesFields([rec.maChamCong, rec.maNV, rec.ngayLamViec, rec.trangThai, STATUS_LABELS[rec.trangThai]], query),
    filterMatcher: (rec, filters) =>
      filters.status === 'all' || rec.trangThai === filters.status,
    sortOptions: [
      { key: 'ngayLamViec', label: 'Ngày', compare: (a, b) => compareStrings(a.ngayLamViec, b.ngayLamViec, 'asc') },
      { key: 'maNV', label: 'Mã NV', compare: (a, b) => compareStrings(a.maNV, b.maNV, 'asc') },
      { key: 'trangThai', label: 'Trạng thái', compare: (a, b) => compareStrings(a.trangThai, b.trangThai, 'asc') },
    ],
  });

  if (!user) return null;

  const presentCount = list.filteredItems.filter((r) => r.trangThai === 'Co mat').length;

  return (
    <div className="space-y-4">
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard icon={CalendarDays} label="Bản ghi (lọc)" value={list.totalFiltered} />
          <StatCard icon={UserCheck} label="Có mặt" value={presentCount} />
          <StatCard icon={CalendarX} label="Tổng bản ghi" value={records.length} />
        </div>
      )}

      {error && <ErrorBanner message={error} hint="Vui lòng kiểm tra kết nối đến server hoặc thử lại." />}

      <DataTableCard
        toolbar={
          <SearchFilterToolbar
            search={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Tìm mã chấm công, mã NV, ngày, trạng thái..."
            filters={[{
              key: 'status',
              label: 'Trạng thái',
              value: list.filters.status,
              onChange: (v) => list.setFilter('status', v),
              options: [{ value: 'all', label: 'Tất cả' }, ...statuses.map((s) => ({ value: s, label: STATUS_LABELS[s] || s }))],
            }]}
            sortKey={list.sortKey}
            onSortKeyChange={list.setSortKey}
            sortOptions={[
              { key: 'ngayLamViec', label: 'Ngày' },
              { key: 'maNV', label: 'Mã NV' },
              { key: 'trangThai', label: 'Trạng thái' },
            ]}
            sortDirection={list.sortDirection}
            onToggleSortDirection={list.toggleSortDirection}
            onReset={list.resetFilters}
            totalFiltered={list.totalFiltered}
            totalItems={records.length}
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
                <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Mã chấm công</TableHead>
                <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Mã NV</TableHead>
                <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Ngày làm việc</TableHead>
                <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={6} columns={4} />
              ) : list.totalFiltered === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState
                      icon={CalendarX}
                      title={records.length === 0 ? 'Chưa có dữ liệu chấm công' : 'Không tìm thấy bản ghi phù hợp'}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                list.paginatedItems.map((rec) => (
                  <TableRow key={rec.maChamCong} className="border-white/10 hover:bg-zinc-800/40">
                    <TableCell className="font-mono text-sm text-zinc-200">{rec.maChamCong}</TableCell>
                    <TableCell className="font-mono text-sm text-zinc-300">{rec.maNV}</TableCell>
                    <TableCell className="font-mono text-sm text-zinc-400 tabular-nums">{rec.ngayLamViec}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[rec.trangThai] || 'bg-zinc-800 text-zinc-300'}>
                        {STATUS_LABELS[rec.trangThai] || rec.trangThai}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableScroll>
      </DataTableCard>
    </div>
  );
}
