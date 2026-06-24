import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OracleSecurityService } from '../database/oracle-security.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly oracleSecurityService: OracleSecurityService,
  ) {}

  async findAll(user: any): Promise<any[]> {
    const connection = await this.databaseService.getConnection();
    try {
      // Kích hoạt Oracle Security Context
      await this.oracleSecurityService.applySecurityPolicies(connection, user);

      // Truy vấn CSDL
      const sql = `
        SELECT MaChamCong "maChamCong", MaNV "maNV", TO_CHAR(NgayLamViec, 'YYYY-MM-DD') "ngayLamViec", TrangThai "trangThai" 
        FROM EMS_ADMIN.CHAM_CONG
      `;
      const result = await connection.execute(sql, [], { outFormat: 4002 /* OBJECT */ });
      return result.rows || [];
    } catch (error: any) {
      throw new InternalServerErrorException('Lỗi truy vấn CSDL Oracle: ' + error.message);
    } finally {
      await connection.close();
    }
  }
}
