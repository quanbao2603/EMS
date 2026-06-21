import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [DatabaseModule, AuthModule, EmployeesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
