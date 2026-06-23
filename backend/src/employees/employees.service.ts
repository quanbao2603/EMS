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
    if (data.luong !== undefined && data.luong !== null && user.role !== 'HR_MANAGER') {
      throw new ForbiddenException('Chỉ HR_MANAGER được phép sửa mức lương.');
    }

    const connection = await this.dbService.getConnection();
    try {
      await this.oracleSecurityService.applySecurityPolicies(connection, user);

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
