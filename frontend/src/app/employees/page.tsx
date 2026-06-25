import { EmployeeTable } from '@/components/EmployeeTable';
import { RoleGuard } from '@/components/RoleGuard';
import { PageHeader } from '@/components/ui/page-header';
import { buttonVariants } from '@/components/ui/button';
import { Users, History } from 'lucide-react';
import Link from 'next/link';

export default function EmployeesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Quản lý nhân sự"
        title="Danh sách Nhân sự"
        description="Dữ liệu được lọc theo phòng ban và quyền hạn của bạn (Oracle VPD)."
        icon={Users}
        actions={
          <RoleGuard allowedRoles={['HR_MANAGER']}>
            <Link
              href="/employees/history"
              className={buttonVariants({ variant: 'outline', className: 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300' })}
            >
              <History className="w-4 h-4 mr-2" />
              Lịch sử thay đổi
            </Link>
          </RoleGuard>
        }
      />
      <EmployeeTable />
    </div>
  );
}
