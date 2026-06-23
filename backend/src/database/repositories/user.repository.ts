import { Injectable } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class UserRepository {
  async findByUsername(connection: oracledb.Connection, username: string): Promise<any> {
    // 1. THIẾT LẬP CONTEXT BYPASS TẠM THỜI ĐỂ LẤY THÔNG TIN NHÂN VIÊN
    await connection.execute(`BEGIN EMS_ADMIN.pkg_sec_admin.set_context('AUTH_PROCESS', 'HR_MANAGER', 'ALL'); END;`);

    // 2. TRUY VẤN
    const sql = `
      SELECT u.ID_User, u.Username, u.Password, u.Role_Name, u.MaNV, nv.MaPB 
      FROM EMS_ADMIN.APP_USERS u
      LEFT JOIN EMS_ADMIN.NHAN_VIEN nv ON u.MaNV = nv.MaNV
      WHERE u.Username = :username
    `;
    const result = await connection.execute(sql, { username }, { outFormat: 4002 /* oracledb.OUT_FORMAT_OBJECT */ });

    // 3. XÓA CONTEXT NGAY LẬP TỨC ĐỂ BẢO MẬT
    await connection.execute(`BEGIN EMS_ADMIN.pkg_sec_admin.set_context('', '', ''); END;`);

    return (result.rows && result.rows.length > 0) ? result.rows[0] : null;
  }
}
