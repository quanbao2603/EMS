import { PayrollTable } from '@/components/PayrollTable';
import { RoleGuard } from '@/components/RoleGuard';
import { PageHeader } from '@/components/ui/page-header';
import { Wallet } from 'lucide-react';

export default function PayrollPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Kế toán"
        title="Bảng tính lương"
        description="Hiển thị dữ liệu lương đã được lọc và che mờ (Redaction) theo quyền hạn Kế toán."
        icon={Wallet}
      />
      <RoleGuard allowedRoles={['ACCOUNTANT']}>
        <PayrollTable />
      </RoleGuard>
    </div>
  );
}
