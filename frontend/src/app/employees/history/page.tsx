'use client';

import { RoleGuard } from '@/components/RoleGuard';
import { useChangeHistory } from '@/hooks/useChangeHistory';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { History as HistoryIcon, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const currency = (v: string | null) =>
  v ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v)) : '-';

export default function EmployeeHistoryPage() {
  const { user } = useAuthStore();
  const { history, loading, error, refetch } = useChangeHistory();

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">Đang tải phiên đăng nhập...</div>
    );
  }

  if (user.role !== 'HR_MANAGER') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h1 className="text-xl font-semibold text-gray-200 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-400 mb-6">Chỉ Trưởng phòng HR (HR_MANAGER) mới xem được lịch sử thay đổi.</p>
        <Link href="/employees">
          <Button variant="outline" className="border-gray-700 text-gray-300">Quay lại danh sách nhân sự</Button>
        </Link>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['HR_MANAGER']}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-blue-500" />
            Lịch sử thay đổi thông tin nhân sự
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-gray-100">
              Toàn bộ hành động chỉnh sửa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 rounded-md bg-red-950/40 border border-red-800 text-red-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{error}</p>
                  <p className="text-sm text-red-400/80 mt-1">
                    Vui lòng kiểm tra kết nối backend và cấu hình Oracle FGA.
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-md border border-gray-800 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800/50">
                    <TableHead className="w-[180px] font-bold text-gray-400">Thời gian</TableHead>
                    <TableHead className="font-bold text-gray-400">Mã NV</TableHead>
                    <TableHead className="font-bold text-gray-400">Người thực hiện</TableHead>
                    <TableHead className="font-bold text-gray-400">Loại thay đổi</TableHead>
                    <TableHead className="font-bold text-gray-400">Nội dung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-32 text-gray-500">Đang tải...</TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-32 text-gray-500">
                        {error ? 'Không thể tải dữ liệu' : 'Chưa có lịch sử thay đổi'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((item, idx) => (
                      <TableRow key={`${item.timestamp}-${item.maNV}-${idx}`} className="hover:bg-gray-800/50 border-gray-800">
                        <TableCell className="text-gray-400 font-mono text-sm">
                          {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-200">{item.maNV || '-'}</TableCell>
                        <TableCell className="text-gray-300">{item.performedBy}</TableCell>
                        <TableCell>
                          {item.eventType === 'EDIT_SALARY' ? (
                            <Badge className="bg-amber-900/50 text-amber-400 border border-amber-800">Lương</Badge>
                          ) : (
                            <Badge className="bg-blue-900/50 text-blue-400 border border-blue-800">Thông tin cá nhân</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {item.eventType === 'EDIT_SALARY' ? (
                            <span>
                              <span className="line-through text-gray-500">{currency(item.oldValue ?? null)}</span>
                              {' → '}
                              <span className="text-green-400 font-semibold">{currency(item.newValue ?? null)}</span>
                            </span>
                          ) : (
                            item.changeSummary
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
