import { Controller, Get, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(@Req() req: any) {
    // req.user được Inject từ JwtStrategy
    return this.employeesService.findAll(req.user);
  }

  @Get('payroll')
  async getPayroll(@Req() req: any) {
    if (req.user.role !== 'ACCOUNTANT') {
      const { ForbiddenException } = require('@nestjs/common');
      throw new ForbiddenException('Chỉ Kế toán mới được truy cập Bảng tính lương');
    }
    return this.employeesService.findAll(req.user);
  }

  @Put(':id')
  @Roles('HR_STAFF', 'HR_MANAGER')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.employeesService.update(id, body, req.user);
  }

  @Get(':id/salary-history')
  async getSalaryHistory(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.getSalaryHistory(id, req.user);
  }
}
