import { PayrollTable } from '@/components/PayrollTable';
import { RoleGuard } from '@/components/RoleGuard';

export default function PayrollPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Bảng tính lương</h1>
          <p className="text-gray-400 mt-2 text-sm">Hiển thị dữ liệu lương đã được lọc và che mờ (Redaction) theo quyền hạn Kế toán.</p>
        </div>
      </div>
      <RoleGuard allowedRoles={['ACCOUNTANT']}>
        <PayrollTable />
      </RoleGuard>
    </div>
  );
}
