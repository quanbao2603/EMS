'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { DataTableCard, DataTableScroll } from '@/components/data-table/data-table-card';
import { SearchFilterToolbar } from '@/components/data-table/search-filter-toolbar';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { useClientListTable } from '@/hooks/useClientListTable';
import { compareNumbers, compareStrings, matchesFields, uniqueSorted } from '@/lib/list-utils';
import { Pencil, Users, Building2, Wallet, UserX, History } from 'lucide-react';
import { departmentBadgeClass } from '@/lib/badge-styles';
import { EmployeeEditForm } from './EmployeeEditForm';
import { SalaryHistoryDialog } from './SalaryHistoryDialog';

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

export function EmployeeTable() {
  const { user } = useAuthStore();
  const { employees, loading, error, updateEmployee } = useEmployees();
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [historyEmp, setHistoryEmp] = useState<string | null>(null);

  const departments = useMemo(
    () => uniqueSorted(employees.map((e) => e.maPB)),
    [employees],
  );

  const list = useClientListTable({
    items: employees,
    defaultSortKey: 'maNV',
    defaultSortDirection: 'asc',
    defaultFilters: { department: 'all', salaryBand: 'all' },
    searchMatcher: (emp, query) =>
      matchesFields([emp.maNV, emp.hoTen, emp.sdt, emp.maPB], query),
    filterMatcher: (emp, filters) => {
      if (filters.department !== 'all' && emp.maPB !== filters.department) return false;
      return matchesSalaryBand(emp.luong, filters.salaryBand);
    },
    sortOptions: [
      { key: 'maNV', label: 'Mã NV', compare: (a, b) => compareStrings(a.maNV, b.maNV, 'asc') },
      { key: 'hoTen', label: 'Họ tên', compare: (a, b) => compareStrings(String(a.hoTen), String(b.hoTen), 'asc') },
      { key: 'maPB', label: 'Phòng ban', compare: (a, b) => compareStrings(a.maPB, b.maPB, 'asc') },
      {
        key: 'luong',
        label: 'Lương',
        compare: (a, b) => compareNumbers(a.luong ?? 0, b.luong ?? 0, 'asc'),
      },
    ],
  });

  if (!user) return null;

  const canViewSalary = user.role !== 'STAFF' && user.role !== 'HR_STAFF';
  const canEdit = user.role === 'HR_MANAGER' || user.role === 'HR_STAFF';
  const columnCount = 5 + (canViewSalary ? 1 : 0) + (canEdit ? 1 : 0);
  const departmentCount = new Set(list.filteredItems.map((e) => e.maPB)).size;
  const totalSalary = list.filteredItems.reduce((sum, e) => sum + (e.luong || 0), 0);

  return (
    <div className="space-y-4">
      {!loading && employees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard icon={Users} label="Nhân sự (đang lọc)" value={list.totalFiltered} />
          <StatCard icon={Building2} label="Phòng ban" value={departmentCount} />
          {canViewSalary && (
            <StatCard
              icon={Wallet}
              label="Tổng quỹ lương"
              value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(totalSalary)}
            />
          )}
        </div>
      )}

      {error && <ErrorBanner message={error} hint="Vui lòng kiểm tra kết nối đến server hoặc thử lại." />}

      <DataTableCard
        toolbar={
          <SearchFilterToolbar
            search={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Tìm mã NV, tên, SĐT, phòng ban..."
            filters={[
              {
                key: 'department',
                label: 'Phòng ban',
                value: list.filters.department,
                onChange: (value) => list.setFilter('department', value),
                options: [{ value: 'all', label: 'Tất cả phòng ban' }, ...departments.map((d) => ({ value: d, label: d }))],
              },
              ...(canViewSalary
                ? [{
                    key: 'salaryBand',
                    label: 'Mức lương',
                    value: list.filters.salaryBand,
                    onChange: (value: string) => list.setFilter('salaryBand', value),
                    options: SALARY_BANDS,
                  }]
                : []),
            ]}
            sortKey={list.sortKey}
            onSortKeyChange={list.setSortKey}
            sortOptions={[
              { key: 'maNV', label: 'Mã NV' },
              { key: 'hoTen', label: 'Họ tên' },
              { key: 'maPB', label: 'Phòng ban' },
              ...(canViewSalary ? [{ key: 'luong', label: 'Lương' }] : []),
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
                <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">Mã NV</TableHead>
                <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">Họ Tên</TableHead>
                <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Ngày Sinh</TableHead>
                <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">SĐT</TableHead>
                <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">Phòng Ban</TableHead>
                {canViewSalary && <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider text-right">Lương</TableHead>}
                {canEdit && <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider w-[100px]">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={6} columns={columnCount} lastColumnAction={canEdit} />
              ) : list.totalFiltered === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnCount}>
                    <EmptyState
                      icon={UserX}
                      title={employees.length === 0 ? 'Không có dữ liệu nhân sự' : 'Không tìm thấy nhân viên phù hợp'}
                      description={employees.length === 0 ? 'Chưa có nhân viên nào thuộc phạm vi xem của bạn.' : 'Thử đổi từ khóa hoặc xóa bộ lọc.'}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                list.paginatedItems.map((emp) => (
                  <TableRow key={emp.maNV} className="border-white/10 hover:bg-zinc-800/40">
                    <TableCell className="font-medium text-zinc-100 font-mono text-sm">{emp.maNV}</TableCell>
                    <TableCell className="text-zinc-300">
                      {emp.hoTen === '***' ? <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">Ẩn</Badge> : emp.hoTen}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm hidden md:table-cell">
                      {emp.ngaySinh === '***' ? '***' : emp.ngaySinh}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm hidden sm:table-cell">
                      {emp.sdt === '***' ? '***' : emp.sdt}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={departmentBadgeClass(emp.maPB)}>{emp.maPB}</Badge>
                    </TableCell>
                    {canViewSalary && (
                      <TableCell className="font-mono text-sm text-emerald-400/90 text-right tabular-nums">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.luong || 0)}
                      </TableCell>
                    )}
                    {canEdit && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => setSelectedEmp(emp)}
                            className="border-white/10 text-zinc-300 hover:bg-zinc-800/80"
                            title="Sửa nhân viên"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {user.role === 'HR_MANAGER' && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => setHistoryEmp(emp.maNV)}
                              className="border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10"
                              title="Lịch sử lương"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableScroll>
      </DataTableCard>

      <EmployeeEditForm
        employee={selectedEmp}
        onClose={() => setSelectedEmp(null)}
        onSave={async (id, data) => {
          const success = await updateEmployee(id, data);
          if (success) setSelectedEmp(null);
        }}
      />

      <SalaryHistoryDialog maNV={historyEmp} onClose={() => setHistoryEmp(null)} />
    </div>
  );
}
