import { EmployeeTable } from '@/components/EmployeeTable';

export default function EmployeesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Danh sách Nhân sự</h1>
      <EmployeeTable />
    </div>
  );
}
