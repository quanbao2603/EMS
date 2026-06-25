'use client';

import { useMemo } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import { useChangeHistory } from '@/hooks/useChangeHistory';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { ChangeHistoryTable } from '@/components/ChangeHistoryTable';
import { History as HistoryIcon, RefreshCw, AlertCircle, FileText, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeHistoryPage() {
  const { user } = useAuthStore();
  const { history, loading, error, refetch } = useChangeHistory();

  const stats = useMemo(() => ({
    total: history.length,
    info: history.filter((h) => h.eventType === 'EDIT_INFO').length,
    salary: history.filter((h) => h.eventType === 'EDIT_SALARY').length,
  }), [history]);

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">Đang tải phiên đăng nhập...</div>
    );
  }

  if (user.role !== 'HR_MANAGER') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h1 className="text-xl font-semibold text-gray-200 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-400 mb-6">Chỉ Trưởng phòng HR (HR_MANAGER) mới xem được lịch sử thay đổi.</p>
        <Link href="/employees">
          <Button variant="outline" className="border-gray-700 text-gray-300">Quay lại danh sách nhân sự</Button>
        </Link>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['HR_MANAGER']}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader
          eyebrow="Lịch sử hệ thống"
          title="Lịch sử thay đổi thông tin nhân sự"
          description="Hợp nhất hành động chỉnh sửa thông tin cá nhân và biến động lương."
          icon={HistoryIcon}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Tổng bản ghi" value={stats.total} icon={HistoryIcon} />
          <StatCard label="Thông tin cá nhân" value={stats.info} icon={FileText} />
          <StatCard label="Biến động lương" value={stats.salary} icon={Wallet} />
        </div>

        {error && (
          <ErrorBanner
            message={error}
            hint="Vui lòng kiểm tra kết nối backend và cấu hình Oracle FGA."
            className="mb-4"
          />
        )}
        <ChangeHistoryTable history={history} loading={loading} />
      </div>
    </RoleGuard>
  );
}
