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
import { format } from 'date-fns';
import { Terminal } from 'lucide-react';

export default function AuditPage() {
  const { logs, loading } = useAuditLogs();

  return (
    <RoleGuard allowedRoles={['HR_MANAGER']}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-100 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-blue-500" />
          Bảng Điều khiển Kiểm toán (FGA)
        </h1>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-gray-100">Audit Logs Server</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-800 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800/50">
                    <TableHead className="w-[180px] font-bold text-gray-400">Thời gian</TableHead>
                    <TableHead className="font-bold text-gray-400">User_DB</TableHead>
                    <TableHead className="font-bold text-gray-400">Thao tác</TableHead>
                    <TableHead className="font-bold text-gray-400">Bảng vi phạm</TableHead>
                    <TableHead className="font-bold text-gray-400">Lệnh SQL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-32 text-gray-500">Đang tải...</TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-32 text-gray-500">Không có dữ liệu log</TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-800/50 border-gray-800">
                        <TableCell className="text-gray-400 font-mono text-sm">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-200">{log.dbUser}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded text-xs font-bold border border-blue-800">
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300">{log.objectName}</TableCell>
                        <TableCell>
                          <code className="bg-gray-950 border border-gray-800 text-green-400 p-1.5 rounded font-mono text-xs block whitespace-pre-wrap break-words max-w-md">
                            {log.sqlText}
                          </code>
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
