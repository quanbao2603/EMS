import { Controller, Get, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
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

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.employeesService.update(id, body, req.user);
  }
}
