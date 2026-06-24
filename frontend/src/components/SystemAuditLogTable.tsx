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
import { RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { useSystemAuditLogs } from '@/hooks/useSystemAuditLogs';
import { Badge } from '@/components/ui/badge';

export function SystemAuditLogTable() {
  const { logs, loading, error, refetch } = useSystemAuditLogs();

  return (
    <Card className="bg-gray-900 border-gray-800 mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-500" />
          Kiểm toán Hệ thống Toàn diện (FGA & Unified Audit)
        </CardTitle>
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
                <TableHead className="font-bold text-gray-400">Người tác động</TableHead>
                <TableHead className="font-bold text-gray-400">Hành động</TableHead>
                <TableHead className="font-bold text-gray-400">Đối tượng</TableHead>
                <TableHead className="font-bold text-gray-400">Câu lệnh SQL</TableHead>
                <TableHead className="font-bold text-gray-400">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-gray-500">Đang tải...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-gray-500">
                    {error ? 'Không thể tải dữ liệu' : 'Chưa có bản ghi giám sát'}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, idx) => {
                  const isWarning = log.trang_thai?.includes('THẤT BẠI') || log.trang_thai?.includes('CẢNH BÁO');
                  return (
                    <TableRow key={`${log.thoi_gian_thuc_hien}-${idx}`} className={`border-gray-800 ${isWarning ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-gray-800/50'}`}>
                      <TableCell className="text-gray-400 text-sm">
                        {log.thoi_gian_thuc_hien ? format(new Date(log.thoi_gian_thuc_hien), 'dd/MM/yyyy HH:mm:ss') : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-200">{log.nguoi_thuc_hien}</TableCell>
                      <TableCell className="text-gray-300">
                        <Badge variant="outline" className="border-gray-700 bg-gray-800 text-xs">
                          {log.loai_hanh_dong}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 font-mono text-sm">{log.bang_tac_dong}</TableCell>
                      <TableCell className="text-gray-400 text-xs max-w-xs truncate" title={log.cau_lenh_sql}>
                        {log.cau_lenh_sql}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={isWarning ? "destructive" : "default"}
                          className={isWarning ? 'bg-red-600 hover:bg-red-700 shadow-md border-red-800' : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'}
                        >
                          {log.trang_thai}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
