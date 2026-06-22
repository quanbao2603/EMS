import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly dbService: DatabaseService) {}

  async findAll(user: any) {
    const connection = await this.dbService.getConnection();
    try {
      // 1. ĐỒNG BỘ: Thiết lập Ngữ cảnh Định danh (VPD Context)
      await connection.execute(
        `BEGIN pkg_sec_admin.set_context(:id, :role, :mapb); END;`,
        {
          id: user.userId,
          role: user.role,
          mapb: user.maPB,
        }
      );

      // 2. ĐỒNG BỘ: Thiết lập Nhãn bảo mật (OLS)
      let label = 'PUB';
      if (['HR_MANAGER', 'MANAGER'].includes(user.role)) label = 'SEC';
      else if (['HR_STAFF', 'ACCOUNTANT'].includes(user.role)) label = 'CONF';

      try {
        await connection.execute(
          `BEGIN SA_SESSION.SET_LABEL('ems_ols_policy', :label); END;`,
          { label }
        );
      } catch (err) {
        // Có thể chưa cấu hình OLS, bỏ qua lỗi nếu chưa setup hoàn chỉnh
        console.warn('OLS SET_LABEL warning:', err.message);
      }

      // 3. Truy vấn danh sách Nhân sự
      // Lúc này Oracle DB sẽ tự động ghép thêm chính sách VPD (MAPB) và OLS vào câu truy vấn.
      const result = await connection.execute(
        `SELECT MaNV "maNV", HoTen "hoTen", TO_CHAR(NgaySinh, 'YYYY-MM-DD') "ngaySinh", SDT "sdt", Luong "luong", MaSoThue "maSoThue", MaPB "maPB" FROM NHAN_VIEN`,
        [],
        { outFormat: 4002 /* OBJECT */ }
      );

      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi truy vấn CSDL Oracle: ' + error.message);
    } finally {
      // Luôn luôn đóng connection để trả về Pool
      await connection.close();
    }
  }
}
