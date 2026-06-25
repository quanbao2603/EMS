'use client';

import { useMemo } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuditMonitoring } from '@/hooks/useAuditMonitoring';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { AuditMonitoringTable } from '@/components/AuditMonitoringTable';
import { ShieldCheck, RefreshCw, Users, FileSearch, AlertTriangle } from 'lucide-react';

export default function AuditPage() {
  const { rows, loading, error, refetch } = useAuditMonitoring();

  const stats = useMemo(() => {
    const performers = new Set(rows.map((r) => r.performedBy));
    const employees = new Set(rows.map((r) => r.maNV).filter(Boolean));
    const warnings = rows.filter((r) => r.status && /thất bại|cảnh báo|fail/i.test(r.status)).length;
    return { total: rows.length, performers: performers.size, employees: employees.size, warnings };
  }, [rows]);

  return (
    <RoleGuard allowedRoles={['HR_MANAGER']}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader
          eyebrow="Giám sát FGA"
          title="Báo cáo Giám sát & Kiểm toán"
          description="Hợp nhất giám sát FGA và kiểm toán hệ thống — một dòng cho mỗi hành động HR."
          icon={ShieldCheck}
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Tổng bản ghi" value={stats.total} icon={FileSearch} />
          <StatCard label="Nhân viên HR thực hiện" value={stats.performers} icon={Users} />
          <StatCard label="Nhân sự bị tác động" value={stats.employees} icon={ShieldCheck} />
          <StatCard label="Cảnh báo / lỗi" value={stats.warnings} icon={AlertTriangle} />
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}
        <AuditMonitoringTable rows={rows} loading={loading} />
      </div>
    </RoleGuard>
  );
}
