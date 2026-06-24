import { AttendanceTable } from '@/components/AttendanceTable';

export default function AttendancePage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Theo dõi Chấm công</h1>
          <p className="text-gray-400 mt-2 text-sm">Dữ liệu được bảo vệ bởi Oracle VPD (Nhân viên chỉ xem của mình, Quản lý xem toàn bộ).</p>
        </div>
      </div>
      <AttendanceTable />
    </div>
  );
}
