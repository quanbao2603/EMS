import type { AuditReportItem } from '@/hooks/useAuditLogs';
import type { SystemAuditLogItem } from '@/hooks/useSystemAuditLogs';

export interface UnifiedAuditRow {
  id: string;
  timestamp: string;
  maNV: string | null;
  performedBy: string;
  changeSummary: string;
  action: string | null;
  targetTable: string | null;
  status: string | null;
  source: 'fga' | 'system';
}

function toMs(value: string): number {
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function sameActor(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function withinWindow(a: string, b: string, windowMs = 90_000): boolean {
  return Math.abs(toMs(a) - toMs(b)) <= windowMs;
}

function systemSummary(log: SystemAuditLogItem): string {
  const parts = [log.loai_hanh_dong, log.bang_tac_dong].filter(Boolean);
  return parts.join(' · ') || 'Hành động hệ thống';
}

export function mergeAuditLogs(
  fgaLogs: AuditReportItem[],
  systemLogs: SystemAuditLogItem[],
): UnifiedAuditRow[] {
  const usedSystem = new Set<number>();
  const rows: UnifiedAuditRow[] = [];

  for (const fga of fgaLogs) {
    const matchIdx = systemLogs.findIndex(
      (sys, idx) =>
        !usedSystem.has(idx) &&
        sameActor(sys.nguoi_thuc_hien, fga.performedBy) &&
        withinWindow(sys.thoi_gian_thuc_hien, fga.timestamp),
    );

    const sys = matchIdx >= 0 ? systemLogs[matchIdx] : null;
    if (matchIdx >= 0) usedSystem.add(matchIdx);

    rows.push({
      id: `fga-${fga.timestamp}-${fga.maNV ?? 'na'}-${fga.performedBy}`,
      timestamp: fga.timestamp,
      maNV: fga.maNV,
      performedBy: fga.performedBy,
      changeSummary: fga.changeSummary,
      action: sys?.loai_hanh_dong ?? null,
      targetTable: sys?.bang_tac_dong ?? null,
      status: sys?.trang_thai ?? null,
      source: 'fga',
    });
  }

  systemLogs.forEach((sys, idx) => {
    if (usedSystem.has(idx)) return;
    rows.push({
      id: `sys-${sys.thoi_gian_thuc_hien}-${idx}`,
      timestamp: sys.thoi_gian_thuc_hien,
      maNV: null,
      performedBy: sys.nguoi_thuc_hien,
      changeSummary: systemSummary(sys),
      action: sys.loai_hanh_dong,
      targetTable: sys.bang_tac_dong,
      status: sys.trang_thai,
      source: 'system',
    });
  });

  return rows.sort((a, b) => toMs(b.timestamp) - toMs(a.timestamp));
}
