'use client';

import { useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { GlassCard } from '@/components/ui/glass-card';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTableCard } from '@/components/data-table/data-table-card';
import { SearchFilterToolbar } from '@/components/data-table/search-filter-toolbar';
import { PaginationControls } from '@/components/data-table/pagination-controls';
import { useClientListTable } from '@/hooks/useClientListTable';
import { compareNumbers, compareStrings, matchesFields, uniqueSorted } from '@/lib/list-utils';
import { LockIcon, Calendar, DollarSign, Activity, Briefcase, FolderX, RefreshCw, Shield, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { OLS_LABEL_CONFIG } from '@/lib/badge-styles';

function OlsBadge({ label }: { label: string }) {
  const config = OLS_LABEL_CONFIG[label];
  if (!config) return null;
  return (
    <Badge className={`${config.className} flex items-center shrink-0`}>
      {label === 'SEC' && <LockIcon className="w-3 h-3 mr-1" />}
      {config.text}
    </Badge>
  );
}

function ProjectCardSkeleton() {
  return (
    <GlassCard>
      <CardHeader className="pb-3">
        <div className="h-5 w-3/4 rounded bg-zinc-800/80 animate-pulse mb-2" />
        <div className="h-3 w-1/3 rounded bg-zinc-800/80 animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 w-1/2 rounded bg-zinc-800/80 animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-zinc-800/80 animate-pulse" />
        <div className="h-4 w-1/4 rounded bg-zinc-800/80 animate-pulse" />
      </CardContent>
    </GlassCard>
  );
}

export default function ProjectsPage() {
  const { projects, loading, error, refetch } = useProjects();

  const statuses = useMemo(() => uniqueSorted(projects.map((p) => p.trangThai)), [projects]);
  const olsLabels = useMemo(() => uniqueSorted(projects.map((p) => p.olsLabel)), [projects]);

  const list = useClientListTable({
    items: projects,
    defaultSortKey: 'tenDA',
    defaultSortDirection: 'asc',
    defaultFilters: { status: 'all', ols: 'all' },
    searchMatcher: (proj, query) =>
      matchesFields([proj.tenDA, proj.maDA, proj.trangThai, proj.olsLabel], query),
    filterMatcher: (proj, filters) => {
      if (filters.status !== 'all' && proj.trangThai !== filters.status) return false;
      if (filters.ols !== 'all' && proj.olsLabel !== filters.ols) return false;
      return true;
    },
    sortOptions: [
      { key: 'tenDA', label: 'Tên dự án', compare: (a, b) => compareStrings(a.tenDA, b.tenDA, 'asc') },
      { key: 'maDA', label: 'Mã dự án', compare: (a, b) => compareStrings(a.maDA, b.maDA, 'asc') },
      { key: 'nganSach', label: 'Ngân sách', compare: (a, b) => compareNumbers(a.nganSach, b.nganSach, 'asc') },
      { key: 'trangThai', label: 'Trạng thái', compare: (a, b) => compareStrings(a.trangThai, b.trangThai, 'asc') },
    ],
  });

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter((p) => p.trangThai?.toLowerCase().includes('đang') || p.trangThai?.toLowerCase().includes('active')).length,
    secured: projects.filter((p) => p.olsLabel === 'SEC').length,
  }), [projects]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        eyebrow="Oracle OLS"
        title="Quản lý Dự án"
        description="Phân loại bảo mật theo nhãn Oracle Label Security (OLS)."
        icon={Briefcase}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="border-white/10 text-zinc-300 hover:bg-zinc-800/80"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        }
      />

      {error && (
        <ErrorBanner
          message={error}
          hint="Vui lòng kiểm tra kết nối đến server hoặc thử lại."
        />
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Tổng dự án" value={stats.total} icon={FolderOpen} />
          <StatCard label="Đang triển khai" value={stats.active} icon={Activity} />
          <StatCard label="Mức SEC" value={stats.secured} icon={Shield} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderX}
          title={error ? 'Không thể tải dữ liệu' : 'Không có dữ liệu dự án'}
          description={!error ? 'Chưa có dự án nào trong phạm vi nhãn bảo mật của bạn.' : undefined}
          className="border border-white/10 rounded-xl"
        />
      ) : (
        <DataTableCard
          toolbar={
            <SearchFilterToolbar
              search={list.search}
              onSearchChange={list.setSearch}
              searchPlaceholder="Tìm tên dự án, mã, trạng thái, nhãn OLS..."
              filters={[
                {
                  key: 'status',
                  label: 'Trạng thái',
                  value: list.filters.status,
                  onChange: (v) => list.setFilter('status', v),
                  options: [{ value: 'all', label: 'Tất cả' }, ...statuses.map((s) => ({ value: s, label: s }))],
                },
                {
                  key: 'ols',
                  label: 'Nhãn OLS',
                  value: list.filters.ols,
                  onChange: (v) => list.setFilter('ols', v),
                  options: [{ value: 'all', label: 'Tất cả' }, ...olsLabels.map((l) => ({ value: l, label: l }))],
                },
              ]}
              sortKey={list.sortKey}
              onSortKeyChange={list.setSortKey}
              sortOptions={[
                { key: 'tenDA', label: 'Tên dự án' },
                { key: 'maDA', label: 'Mã dự án' },
                { key: 'nganSach', label: 'Ngân sách' },
                { key: 'trangThai', label: 'Trạng thái' },
              ]}
              sortDirection={list.sortDirection}
              onToggleSortDirection={list.toggleSortDirection}
              onReset={list.resetFilters}
              totalFiltered={list.totalFiltered}
              totalItems={projects.length}
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
          {list.totalFiltered === 0 ? (
            <EmptyState icon={FolderX} title="Không tìm thấy dự án phù hợp" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {list.paginatedItems.map((proj) => (
                <GlassCard
                  key={proj.maDA}
                  className={`transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_-12px_rgba(16,185,129,0.25)] ${proj.olsLabel === 'SEC' ? 'border-red-500/30 bg-red-950/20' : ''}`}
                >
                  <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-lg font-bold text-zinc-100 truncate">{proj.tenDA}</CardTitle>
                      <CardDescription className="text-sm text-zinc-500 mt-1 font-mono">{proj.maDA}</CardDescription>
                    </div>
                    <OlsBadge label={proj.olsLabel} />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mt-2 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span className="font-medium text-zinc-300 tabular-nums">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(proj.nganSach)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span className="text-zinc-300">
                          {proj.ngayBatDau ? format(new Date(proj.ngayBatDau), 'dd/MM/yyyy') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span className="font-medium text-zinc-300">{proj.trangThai}</span>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>
              ))}
            </div>
          )}
        </DataTableCard>
      )}
    </div>
  );
}
