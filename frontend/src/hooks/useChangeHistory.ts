import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/utils/axiosClient';

export interface ChangeHistoryItem {
  timestamp: string;
  performedBy: string;
  maNV: string | null;
  eventType: 'EDIT_INFO' | 'EDIT_SALARY';
  changeSummary: string;
  oldValue?: string | null;
  newValue?: string | null;
}

export function useChangeHistory() {
  const [history, setHistory] = useState<ChangeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/audit/history');
      setHistory(res.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tải lịch sử thay đổi';
      setError(message);
      setHistory([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
}
