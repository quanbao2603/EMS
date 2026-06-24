'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import axiosClient from '@/utils/axiosClient';
import { Employee } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PayrollTable() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await axiosClient.get('/employees/payroll');
        setEmployees(res.data);
      } catch (error) {
        console.error('Failed to fetch payroll:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'ACCOUNTANT') {
      fetchPayroll();
    }
  }, [user]);

  if (!user || user.role !== 'ACCOUNTANT') return <div className="text-red-400">Không có quyền truy cập</div>;

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800/50">
              <TableHead className="text-gray-400">Mã NV</TableHead>
              <TableHead className="text-gray-400">Mức Lương</TableHead>
              <TableHead className="text-gray-400">Mã Số Thuế</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-32 text-gray-500">Đang tải...</TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-32 text-gray-500">Không có dữ liệu</TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.maNV} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="font-medium text-gray-200">{emp.maNV}</TableCell>
                  <TableCell className="font-mono text-green-400 font-semibold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.luong || 0)}
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono">
                    {emp.maSoThue}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
