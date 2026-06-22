import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
}
