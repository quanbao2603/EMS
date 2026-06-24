import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/utils/axiosClient';

export interface SystemAuditLogItem {
  thoi_gian_thuc_hien: string;
  nguoi_thuc_hien: string;
  bang_tac_dong: string;
  loai_hanh_dong: string;
  cau_lenh_sql: string;
  du_lieu_thay_doi: string;
  ten_chinh_sach: string;
  trang_thai: string;
}

export function useSystemAuditLogs() {
  const [logs, setLogs] = useState<SystemAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/audit/system-logs');
      setLogs(res.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tải báo cáo kiểm toán hệ thống';
      setError(message);
      setLogs([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}
