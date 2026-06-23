import { Injectable, Logger } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class OracleSecurityService {
  private readonly logger = new Logger(OracleSecurityService.name);

  /**
   * Áp dụng các chính sách bảo mật gốc của Oracle (VPD Context & OLS) vào một Connection.
   * LƯU Ý: Phải được gọi ĐỒNG BỘ trên CÙNG một Connection trước khi thực thi truy vấn.
   */
  async applySecurityPolicies(connection: oracledb.Connection, user: any): Promise<void> {
    // 1. Thiết lập Ngữ cảnh Định danh (VPD Context)
    await connection.execute(
      `BEGIN EMS_ADMIN.pkg_sec_admin.set_context(:id, :role, :mapb); END;`,
      {
        id: user.userId,
        role: user.role,
        mapb: user.maPB,
      }
    );

    // 2. Thiết lập Nhãn bảo mật (OLS)
    let label = 'PUB';
    if (['HR_MANAGER', 'MANAGER'].includes(user.role)) label = 'SEC';
    else if (['HR_STAFF', 'ACCOUNTANT'].includes(user.role)) label = 'CONF';

    try {
      await connection.execute(
        `BEGIN SA_SESSION.SET_LABEL('ems_ols_policy', :label); END;`,
        { label }
      );
    } catch (err: any) {
      this.logger.warn('OLS SET_LABEL warning: ' + err.message);
    }
  }
}
