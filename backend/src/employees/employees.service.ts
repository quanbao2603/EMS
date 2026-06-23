import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly dbService: DatabaseService) {}

  private async setSecurityContext(connection: any, user: any) {
    // 1. ĐỒNG BỘ: Thiết lập Ngữ cảnh Định danh (VPD Context) + CLIENT_IDENTIFIER (cho FGA)
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
  }

  async findAll(user: any) {
    const connection = await this.dbService.getConnection();
    try {
      await this.setSecurityContext(connection, user);

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

  async update(maNV: string, data: any, user: any) {
    if (data.luong !== undefined && data.luong !== null && user.role !== 'HR_MANAGER') {
      throw new ForbiddenException('Chỉ HR_MANAGER được phép sửa mức lương.');
    }

    const connection = await this.dbService.getConnection();
    try {
      await this.setSecurityContext(connection, user);

      // FGA policy FGA_HR_EDIT_NHANVIEN sẽ tự động ghi log nếu Context ROLE = 'HR_STAFF'
      await connection.execute(
        `UPDATE NHAN_VIEN SET HoTen = :hoTen, SDT = :sdt, MaPB = :maPB${user.role === 'HR_MANAGER' ? ', Luong = :luong' : ''} WHERE MaNV = :maNV`,
        user.role === 'HR_MANAGER'
          ? { hoTen: data.hoTen, sdt: data.sdt, maPB: data.maPB, luong: data.luong, maNV }
          : { hoTen: data.hoTen, sdt: data.sdt, maPB: data.maPB, maNV }
      );
      await connection.commit();

      return { message: 'Cập nhật thành công' };
    } catch (error) {
      throw new InternalServerErrorException('Lỗi cập nhật CSDL Oracle: ' + error.message);
    } finally {
      await connection.close();
    }
  }
}
