import { AttendanceTable } from '@/components/AttendanceTable';
import { PageHeader } from '@/components/ui/page-header';
import { History } from 'lucide-react';

export default function AttendancePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Chấm công"
        title="Theo dõi Chấm công"
        description="Dữ liệu được bảo vệ bởi Oracle VPD (Nhân viên chỉ xem của mình, Quản lý xem toàn bộ)."
        icon={History}
      />
      <AttendanceTable />
    </div>
  );
}
