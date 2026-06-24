'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { EmployeeEditForm } from './EmployeeEditForm';
import { RoleGuard } from './RoleGuard';
import { SalaryHistoryDialog } from './SalaryHistoryDialog';

export function EmployeeTable() {
  const { user } = useAuthStore();
  const { employees, loading, updateEmployee } = useEmployees();
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [historyEmp, setHistoryEmp] = useState<string | null>(null);

  if (!user) return null;

  const canViewSalary = user.role !== 'STAFF' && user.role !== 'HR_STAFF';

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800/50">
              <TableHead className="text-gray-400">Mã NV</TableHead>
              <TableHead className="text-gray-400">Họ Tên</TableHead>
              <TableHead className="text-gray-400">Ngày Sinh</TableHead>
              <TableHead className="text-gray-400">SĐT</TableHead>
              <TableHead className="text-gray-400">Phòng Ban</TableHead>
              {canViewSalary && <TableHead className="text-gray-400">Mức Lương</TableHead>}
              <RoleGuard allowedRoles={['HR_MANAGER', 'HR_STAFF']}>
                <TableHead className="text-gray-400">Hành động</TableHead>
              </RoleGuard>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-gray-500">Đang tải...</TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-gray-500">Không có dữ liệu</TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.maNV} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="font-medium text-gray-200">{emp.maNV}</TableCell>
                  <TableCell className="text-gray-300">
                    {emp.hoTen === '***' ? <Badge variant="secondary" className="bg-gray-800 text-gray-400">Dữ liệu ẩn</Badge> : emp.hoTen}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {emp.ngaySinh === '***' ? <Badge variant="secondary" className="bg-gray-800 text-gray-400">***</Badge> : emp.ngaySinh}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {emp.sdt === '***' ? <Badge variant="secondary" className="bg-gray-800 text-gray-400">***</Badge> : emp.sdt}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-700 text-gray-300">{emp.maPB}</Badge>
                  </TableCell>
                  {canViewSalary && (
                    <TableCell className="font-mono text-gray-300">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.luong || 0)}
                    </TableCell>
                  )}
                  <RoleGuard allowedRoles={['HR_MANAGER', 'HR_STAFF']}>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedEmp(emp)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                          <Pencil className="w-4 h-4 mr-1" /> Sửa
                        </Button>
                        {user.role === 'HR_MANAGER' && (
                          <Button variant="outline" size="sm" onClick={() => setHistoryEmp(emp.maNV)} className="border-gray-700 text-blue-400 hover:bg-blue-900/30">
                            Lịch sử
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </RoleGuard>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EmployeeEditForm
        employee={selectedEmp}
        onClose={() => setSelectedEmp(null)}
        onSave={async (id, data) => {
          const success = await updateEmployee(id, data);
          if (success) {
            setSelectedEmp(null);
          }
        }}
      />

      <SalaryHistoryDialog
        maNV={historyEmp}
        onClose={() => setHistoryEmp(null)}
      />
    </div>
  );
}
