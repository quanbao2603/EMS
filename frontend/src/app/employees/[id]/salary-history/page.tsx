'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSalaryHistory } from '@/hooks/useSalaryHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function SalaryHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const maNV = params.id as string;
  const { history, loading } = useSalaryHistory(maNV);

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-300 hover:text-white hover:bg-gray-800">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Lịch sử Biến động Lương - {maNV}</h1>
      
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100">Timeline Biến động</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">Chưa có lịch sử biến động lương.</p>
          ) : (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
              {history.map((item) => {
                const isUp = item.luongMoi > item.luongCu;
                return (
                  <div key={item.maLichSu} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-gray-800 text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {isUp ? <TrendingUp className="text-green-500 w-5 h-5" /> : <TrendingDown className="text-red-500 w-5 h-5" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-gray-800 bg-gray-950 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-gray-200">
                          Người thực hiện: {item.nguoiThucHien}
                        </div>
                        <time className="font-caveat font-medium text-blue-400">
                          {format(new Date(item.ngayDoi), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </time>
                      </div>
                      <div className="text-gray-400 flex items-center gap-2">
                        <span className="line-through text-gray-500">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.luongCu)}
                        </span>
                        <ArrowLeft className="w-4 h-4 rotate-180 text-gray-600" />
                        <span className={`font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.luongMoi)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
