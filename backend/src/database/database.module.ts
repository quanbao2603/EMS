import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { UserRepository } from './repositories/user.repository';
import { EmployeeRepository } from './repositories/employee.repository';
import { OracleSecurityService } from './oracle-security.service';

@Global()
@Module({
  providers: [DatabaseService, UserRepository, EmployeeRepository, OracleSecurityService],
  exports: [DatabaseService, UserRepository, EmployeeRepository, OracleSecurityService],
})
export class DatabaseModule {}
