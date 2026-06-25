import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EmployeeRepository } from '../database/repositories/employee.repository';
import { OracleSecurityService } from '../database/oracle-security.service';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly employeeRepository: EmployeeRepository,
    private readonly oracleSecurityService: OracleSecurityService,
  ) {}

  async findAll(user: any) {
    const connection = await this.dbService.getConnection();
    try {
      // 1. Áp dụng chính sách bảo mật gốc của Oracle (Context/OLS)
      await this.oracleSecurityService.applySecurityPolicies(connection, user);

      // 2. Lấy dữ liệu qua Repository (DB tự động lọc theo chính sách trên)
      const employees = await this.employeeRepository.findAll(connection);
      
      return employees;
    } catch (error: any) {
      throw new InternalServerErrorException('Lỗi truy vấn CSDL Oracle: ' + error.message);
    } finally {
      // 3. Đóng connection trả về Pool
      await connection.close();
    }
  }

  async update(maNV: string, data: any, user: any) {
    const connection = await this.dbService.getConnection();
    try {
      await this.oracleSecurityService.applySecurityPolicies(connection, user);

      // FGA policy FGA_HR_EDIT_NHANVIEN sẽ tự động ghi log nếu Context ROLE = 'HR_STAFF'
      const hasLuong = data.luong !== undefined && data.luong !== null;
      const result = await connection.execute(
        `UPDATE NHAN_VIEN SET HoTen = :hoTen, SDT = :sdt, MaPB = :maPB${hasLuong ? ', Luong = :luong' : ''} WHERE MaNV = :maNV`,
        hasLuong
          ? { hoTen: data.hoTen, sdt: data.sdt, maPB: data.maPB, luong: data.luong, maNV }
          : { hoTen: data.hoTen, sdt: data.sdt, maPB: data.maPB, maNV }
      );

      // VPD policy fun_vpd_nhanvien_dml lọc ngầm: nếu dòng nằm ngoài phạm vi được
      // phép sửa (ví dụ HR_STAFF đụng vào người phòng HR) -> Oracle trả 0 rows,
      // KHÔNG báo lỗi. Phải tự kiểm tra rowsAffected để báo đúng cho người dùng.
      if (!result.rowsAffected) {
        await connection.rollback();
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa nhân viên này (ngoài phạm vi VPD cho phép).');
      }

      await connection.commit();
      return { message: 'Cập nhật thành công' };
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      // Trigger trg_block_salary_edit chặn sửa Lương -> raise ORA-20403
      if (error?.errorNum === 20403 || /ORA-20403/.test(error?.message || '')) {
        throw new ForbiddenException('Chỉ HR_MANAGER được phép sửa mức lương.');
      }
      throw new InternalServerErrorException('Lỗi cập nhật CSDL Oracle: ' + error.message);
    } finally {
      await connection.close();
    }
  }

  async getSalaryHistory(maNV: string, user: any) {
    const connection = await this.dbService.getConnection();
    try {
      await this.oracleSecurityService.applySecurityPolicies(connection, user);

      const result = await connection.execute(
        `SELECT l.NgayDoi "ngayDoi",
                NVL(au.username, l.NguoiThucHien) "nguoiThucHien",
                l.LuongCu "luongCu",
                l.LuongMoi "luongMoi"
         FROM LICH_SU_LUONG l
         LEFT JOIN APP_USERS au ON au.ID_User = l.NguoiThucHien
         WHERE l.MaNV = :maNV
         ORDER BY l.NgayDoi DESC`,
        { maNV },
        { outFormat: 4002 /* OBJECT */ }
      );

      return result.rows || [];
    } catch (error) {
      throw new InternalServerErrorException('Lỗi truy vấn lịch sử lương: ' + error.message);
    } finally {
      await connection.close();
    }
  }
}
