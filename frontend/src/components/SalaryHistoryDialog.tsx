import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';
import { ArrowRight, History, TrendingUp } from 'lucide-react';

interface SalaryHistoryItem {
  ngayDoi: string;
  nguoiThucHien: string;
  luongCu: number;
  luongMoi: number;
}

interface SalaryHistoryDialogProps {
  maNV: string | null;
  onClose: () => void;
}

export function SalaryHistoryDialog({ maNV, onClose }: SalaryHistoryDialogProps) {
  const [history, setHistory] = useState<SalaryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!maNV) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/employees/${maNV}/salary-history`);
        setHistory(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [maNV]);

  return (
    <Dialog open={!!maNV} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-950 border-gray-800 text-gray-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Lịch sử thay đổi lương
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Biến động lương của nhân viên {maNV}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-md bg-gray-900 border border-gray-800 animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Chưa có lịch sử thay đổi lương"
              description="Mọi thay đổi mức lương của nhân viên này sẽ hiển thị tại đây."
            />
          ) : (
            <div className="relative border-l border-gray-800 ml-3 pl-6 space-y-6">
              {history.map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-gray-950" />
                  <div className="text-sm text-gray-400 mb-1">
                    {format(new Date(item.ngayDoi), 'dd/MM/yyyy HH:mm')} - Thực hiện bởi:{' '}
                    <span className="font-semibold text-gray-300">{item.nguoiThucHien}</span>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-md p-3 flex items-center justify-between text-gray-300">
                    <span className="line-through text-gray-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.luongCu)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-green-500 mx-2" />
                    <span className="font-bold text-green-400">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.luongMoi)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
