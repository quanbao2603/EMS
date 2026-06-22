import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/utils/axiosClient';
import { triggerSecurityToast } from '@/utils/SecurityToast';

interface SalaryHistoryItem {
  maLichSu: number;
  luongCu: number;
  luongMoi: number;
  ngayDoi: string;
  nguoiThucHien: string;
}

export function useSalaryHistory(employeeId: string) {
  const [history, setHistory] = useState<SalaryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await axiosClient.get(`/employees/${employeeId}/salary-history`);
      setHistory(res.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        triggerSecurityToast('Không có quyền xem lịch sử lương');
      }
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, refetch: fetchHistory };
}
