'use client';

import { RoleGuard } from '@/components/RoleGuard';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function AuditPage() {
  const { logs, loading, error, refetch } = useAuditLogs();

  return (
    <RoleGuard allowedRoles={['HR_MANAGER']}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            Báo cáo Giám sát chỉnh sửa Nhân sự
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
              Các thay đổi thông tin cá nhân do Nhân viên phòng HR thực hiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 rounded-md bg-red-950/40 border border-red-800 text-red-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}
            <div className="rounded-md border border-gray-800 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800/50">
                    <TableHead className="w-[180px] font-bold text-gray-400">Thời gian</TableHead>
                    <TableHead className="font-bold text-gray-400">Mã NV</TableHead>
                    <TableHead className="font-bold text-gray-400">Người thực hiện</TableHead>
                    <TableHead className="font-bold text-gray-400">Nội dung thay đổi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-32 text-gray-500">Đang tải...</TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-32 text-gray-500">
                        {error ? 'Không thể tải dữ liệu' : 'Chưa có bản ghi giám sát'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log, idx) => (
                      <TableRow key={`${log.timestamp}-${log.maNV}-${idx}`} className="hover:bg-gray-800/50 border-gray-800">
                        <TableCell className="text-gray-400 text-sm">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-200">{log.maNV || '-'}</TableCell>
                        <TableCell className="text-gray-300">{log.performedBy}</TableCell>
                        <TableCell className="text-gray-300">{log.changeSummary}</TableCell>
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
