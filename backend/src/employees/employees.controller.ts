import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('employees')
@UseGuards(AuthGuard('jwt'))
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(@Req() req: any) {
    // req.user được Inject từ JwtStrategy
    return this.employeesService.findAll(req.user);
  }
}
