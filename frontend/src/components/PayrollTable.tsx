'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import axiosClient from '@/utils/axiosClient';
import { Employee } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ErrorBanner } from '@/components/ui/error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { DataTableCard, DataTableScroll } from '@/components/data-table/data-table-card';
import { SearchFilterToolbar } from '@/components/data-table/search-filter-toolbar';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { useClientListTable } from '@/hooks/useClientListTable';
import { compareNumbers, compareStrings, matchesFields } from '@/lib/list-utils';
import { Wallet, Users, ShieldAlert } from 'lucide-react';

type ApiError = { response?: { data?: { message?: string } } };

const SALARY_BANDS = [
  { value: 'all', label: 'Mọi mức lương' },
  { value: 'lt15', label: 'Dưới 15 triệu' },
  { value: '15-25', label: '15 – 25 triệu' },
  { value: 'gt25', label: 'Trên 25 triệu' },
];

function matchesSalaryBand(luong: number | undefined, band: string): boolean {
  if (!band || band === 'all') return true;
  const value = luong ?? 0;
  if (band === 'lt15') return value < 15_000_000;
  if (band === '15-25') return value >= 15_000_000 && value <= 25_000_000;
  if (band === 'gt25') return value > 25_000_000;
  return true;
}

export function PayrollTable() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayroll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/employees/payroll');
      setEmployees(res.data);
    } catch (err: unknown) {
      setError((err as ApiError)?.response?.data?.message || 'Không thể tải bảng tính lương.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ACCOUNTANT') fetchPayroll();
  }, [user, fetchPayroll]);

  const list = useClientListTable({
    items: employees,
    defaultSortKey: 'maNV',
    defaultSortDirection: 'asc',
    defaultFilters: { salaryBand: 'all' },
    searchMatcher: (emp, query) =>
      matchesFields([emp.maNV, emp.maSoThue, String(emp.luong ?? '')], query),
    filterMatcher: (emp, filters) => matchesSalaryBand(emp.luong, filters.salaryBand),
    sortOptions: [
      { key: 'maNV', label: 'Mã NV', compare: (a, b) => compareStrings(a.maNV, b.maNV, 'asc') },
      { key: 'luong', label: 'Lương', compare: (a, b) => compareNumbers(a.luong ?? 0, b.luong ?? 0, 'asc') },
      { key: 'maSoThue', label: 'Mã số thuế', compare: (a, b) => compareStrings(a.maSoThue, b.maSoThue, 'asc') },
    ],
  });

  if (!user || user.role !== 'ACCOUNTANT') {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Không có quyền truy cập"
        description="Chỉ bộ phận Kế toán mới được xem Bảng tính lương."
        className="border border-white/10 rounded-xl"
      />
    );
  }

  const totalSalary = list.filteredItems.reduce((sum, e) => sum + (e.luong || 0), 0);

  return (
    <div className="space-y-4">
      {!loading && employees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard icon={Users} label="Nhân viên (lọc)" value={list.totalFiltered} />
          <StatCard
            icon={Wallet}
            label="Tổng quỹ lương"
            value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(totalSalary)}
          />
        </div>
      )}

      {error && <ErrorBanner message={error} hint="Vui lòng kiểm tra kết nối đến server hoặc thử lại." />}

      <DataTableCard
        toolbar={
          <SearchFilterToolbar
            search={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Tìm mã NV, mã số thuế, lương..."
            filters={[{
              key: 'salaryBand',
              label: 'Mức lương',
              value: list.filters.salaryBand,
              onChange: (v) => list.setFilter('salaryBand', v),
              options: SALARY_BANDS,
            }]}
            sortKey={list.sortKey}
            onSortKeyChange={list.setSortKey}
            sortOptions={[
              { key: 'maNV', label: 'Mã NV' },
              { key: 'luong', label: 'Lương' },
              { key: 'maSoThue', label: 'Mã số thuế' },
            ]}
            sortDirection={list.sortDirection}
            onToggleSortDirection={list.toggleSortDirection}
            onReset={list.resetFilters}
            totalFiltered={list.totalFiltered}
            totalItems={employees.length}
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
                <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Mã NV</TableHead>
                <TableHead className="text-zinc-500 text-xs uppercase tracking-wider text-right">Mức lương</TableHead>
                <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Mã số thuế</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={6} columns={3} />
              ) : list.totalFiltered === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <EmptyState icon={Wallet} title={employees.length === 0 ? 'Không có dữ liệu lương' : 'Không tìm thấy bản ghi phù hợp'} />
                  </TableCell>
                </TableRow>
              ) : (
                list.paginatedItems.map((emp) => (
                  <TableRow key={emp.maNV} className="border-white/10 hover:bg-zinc-800/40">
                    <TableCell className="font-mono text-sm text-zinc-200">{emp.maNV}</TableCell>
                    <TableCell className="font-mono text-sm text-emerald-400 text-right tabular-nums">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.luong || 0)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-zinc-400">{emp.maSoThue}</TableCell>
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
