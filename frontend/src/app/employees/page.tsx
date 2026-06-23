import { EmployeeTable } from '@/components/EmployeeTable';
import { RoleGuard } from '@/components/RoleGuard';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { History } from 'lucide-react';

export default function EmployeesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Danh sách Nhân sự</h1>
        <RoleGuard allowedRoles={['HR_MANAGER']}>
          <Link
            href="/employees/history"
            className={buttonVariants({ variant: 'outline', className: 'border-gray-700 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300' })}
          >
            <History className="w-4 h-4 mr-2" />
            Lịch sử thay đổi
          </Link>
        </RoleGuard>
      </div>
      <EmployeeTable />
    </div>
  );
}
