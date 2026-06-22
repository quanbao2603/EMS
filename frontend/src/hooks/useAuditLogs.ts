import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/utils/axiosClient';

interface AuditLog {
  timestamp: string;
  dbUser: string;
  action: string;
  objectName: string;
  sqlText: string;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/audit/logs');
      setLogs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}
