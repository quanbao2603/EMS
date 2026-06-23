import { Injectable } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class EmployeeRepository {
  async findAll(connection: oracledb.Connection): Promise<any[]> {
    // Oracle DB sẽ tự động ghép thêm chính sách VPD (MAPB) và OLS vào câu truy vấn nhờ vào Context của Connection hiện tại.
    const sql = `SELECT MaNV "maNV", HoTen "hoTen", TO_CHAR(NgaySinh, 'YYYY-MM-DD') "ngaySinh", SDT "sdt", Luong "luong", MaSoThue "maSoThue", MaPB "maPB" FROM EMS_ADMIN.NHAN_VIEN`;
    const result = await connection.execute(sql, [], { outFormat: 4002 /* OBJECT */ });
    return result.rows || [];
  }
}
