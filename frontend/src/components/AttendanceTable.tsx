'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import axiosClient from '@/utils/axiosClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AttendanceRecord {
  maChamCong: string;
  maNV: string;
  ngayLamViec: string;
  trangThai: string;
}

export function AttendanceTable() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axiosClient.get('/attendance');
        setRecords(res.data);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchAttendance();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800/50">
              <TableHead className="text-gray-400">Mã Chấm Công</TableHead>
              <TableHead className="text-gray-400">Mã NV</TableHead>
              <TableHead className="text-gray-400">Ngày Làm Việc</TableHead>
              <TableHead className="text-gray-400">Trạng Thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-gray-500">Đang tải...</TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-gray-500">Không có dữ liệu</TableCell>
              </TableRow>
            ) : (
              records.map((rec) => (
                <TableRow key={rec.maChamCong} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="font-medium text-gray-200">{rec.maChamCong}</TableCell>
                  <TableCell className="text-gray-300">{rec.maNV}</TableCell>
                  <TableCell className="text-gray-300 font-mono">{rec.ngayLamViec}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={rec.trangThai === 'Có mặt' ? 'default' : rec.trangThai === 'Trễ' ? 'secondary' : 'destructive'}
                      className={
                        rec.trangThai === 'Có mặt' ? 'bg-green-600 hover:bg-green-700' :
                        rec.trangThai === 'Trễ' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                        'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {rec.trangThai}
                    </Badge>
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
