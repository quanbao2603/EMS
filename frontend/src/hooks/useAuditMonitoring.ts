import { useCallback, useMemo } from 'react';
import { useAuditLogs } from './useAuditLogs';
import { useSystemAuditLogs } from './useSystemAuditLogs';
import { mergeAuditLogs } from '@/lib/merge-audit-logs';

export function useAuditMonitoring() {
  const fga = useAuditLogs();
  const system = useSystemAuditLogs();

  const rows = useMemo(
    () => mergeAuditLogs(fga.logs, system.logs),
    [fga.logs, system.logs],
  );

  const refetch = useCallback(() => {
    void fga.refetch();
    void system.refetch();
  }, [fga, system]);

  const error = fga.error && system.error
    ? `${fga.error} · ${system.error}`
    : fga.error ?? system.error;

  return {
    rows,
    loading: fga.loading || system.loading,
    error,
    refetch,
  };
}
