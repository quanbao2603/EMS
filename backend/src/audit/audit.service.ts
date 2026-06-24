import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { formatPersonalInfoChange, formatSalaryChange } from './audit-change-formatter';

@Injectable()
export class AuditService {
  constructor(private readonly dbService: DatabaseService) {}

  async getHrEditLogs() {
    let connection;
    try {
      connection = await this.dbService.getConnection();
      const result = await connection.execute(
        `SELECT log_time "timestamp", real_user_name "performedBy",
                REPLACE(DBMS_LOB.SUBSTR(sql_text, 4000, 1), CHR(0), '') "detailSql",
                REPLACE(DBMS_LOB.SUBSTR(sql_binds, 4000, 1), CHR(0), '') "detailBinds"
         FROM VW_AUDIT_HR_EDITS ORDER BY log_time DESC`,
        [],
        { outFormat: 4002 /* OBJECT */ },
      );

      return (result.rows as any[]).map((row) => {
        const { maNV, changeSummary } = formatPersonalInfoChange(
          row.detailSql,
          row.detailBinds,
          null,
        );
        return {
          timestamp: row.timestamp,
          performedBy: row.performedBy,
          maNV,
          changeSummary,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException('Lỗi truy vấn báo cáo giám sát: ' + (error?.message || 'unknown'));
    } finally {
      if (connection) await connection.close();
    }
  }

  async getFullChangeHistory() {
    let connection;
    try {
      connection = await this.dbService.getConnection();
      const result = await connection.execute(
        `SELECT event_time "timestamp", performed_by "performedBy", ma_nv "maNV", event_type "eventType",
                detail_sql "detailSql", detail_binds "detailBinds", old_value "oldValue", new_value "newValue"
         FROM (
           SELECT
             f.log_time AS event_time,
             f.real_user_name AS performed_by,
             NULL AS ma_nv,
             'EDIT_INFO' AS event_type,
             REPLACE(DBMS_LOB.SUBSTR(f.sql_text, 4000, 1), CHR(0), '') AS detail_sql,
             REPLACE(DBMS_LOB.SUBSTR(f.sql_binds, 4000, 1), CHR(0), '') AS detail_binds,
             NULL AS old_value,
             NULL AS new_value
           FROM VW_AUDIT_HR_EDITS f
           UNION ALL
           SELECT
             l.NgayDoi,
             NVL(au.username, l.NguoiThucHien),
             l.MaNV,
             'EDIT_SALARY',
             NULL,
             NULL,
             TO_CHAR(l.LuongCu),
             TO_CHAR(l.LuongMoi)
           FROM LICH_SU_LUONG l
           LEFT JOIN APP_USERS au ON au.ID_User = l.NguoiThucHien
         )
         ORDER BY event_time DESC`,
        [],
        { outFormat: 4002 /* OBJECT */ },
      );

      return (result.rows as any[]).map((row) => {
        if (row.eventType === 'EDIT_SALARY') {
          return {
            timestamp: row.timestamp,
            performedBy: row.performedBy,
            maNV: row.maNV,
            eventType: row.eventType,
            changeSummary: formatSalaryChange(row.oldValue, row.newValue),
            oldValue: row.oldValue,
            newValue: row.newValue,
          };
        }

        const { maNV, changeSummary } = formatPersonalInfoChange(
          row.detailSql,
          row.detailBinds,
          null,
        );
        return {
          timestamp: row.timestamp,
          performedBy: row.performedBy,
          maNV,
          eventType: row.eventType,
          changeSummary,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException('Lỗi truy vấn Lịch sử thay đổi: ' + (error?.message || 'unknown'));
    } finally {
      if (connection) await connection.close();
    }
  }

  async getSystemAuditLogs() {
    let connection;
    try {
      connection = await this.dbService.getConnection();
      const result = await connection.execute(
        `SELECT EMS_ADMIN.get_audit_logs() AS "json_data" FROM DUAL`,
        [],
        { outFormat: 4002 /* OBJECT */ },
      );
      
      const rows = result.rows as any[];
      if (rows.length > 0 && rows[0].json_data) {
        return JSON.parse(rows[0].json_data);
      }
      return [];
    } catch (error) {
      throw new InternalServerErrorException('Lỗi truy vấn System Audit Logs: ' + (error?.message || 'unknown'));
    } finally {
      if (connection) await connection.close();
    }
  }
}
