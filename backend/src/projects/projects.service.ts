import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OracleSecurityService } from '../database/oracle-security.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly oracleSecurityService: OracleSecurityService,
  ) {}

  async findAll(user: any): Promise<any[]> {
    const connection = await this.databaseService.getConnection();
    try {
      // 1. Kích hoạt OLS Policy trên Connection này
      await this.oracleSecurityService.applySecurityPolicies(connection, user);

      // 2. Truy vấn dữ liệu (OLS sẽ tự động lọc dữ liệu dựa trên nhãn của user)
      const sql = `
        SELECT MaDA "maDA", TenDA "tenDA", NganSach "nganSach", 
               TO_CHAR(NgayBatDau, 'YYYY-MM-DD') "ngayBatDau", TrangThai "trangThai" 
        FROM DU_AN
      `;
      const result = await connection.execute(sql, [], { outFormat: 4002 }); // oracledb.OUT_FORMAT_OBJECT = 4002
      return result.rows || [];
    } finally {
      await connection.close();
    }
  }
}
