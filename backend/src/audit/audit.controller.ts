import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('audit')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles('HR_MANAGER')
  async getLogs() {
    return this.auditService.getHrEditLogs();
  }

  @Get('history')
  @Roles('HR_MANAGER')
  async getFullHistory() {
    return this.auditService.getFullChangeHistory();
  }
}
