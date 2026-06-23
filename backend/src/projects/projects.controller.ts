import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Req() req: any) {
    // req.user được Inject từ JwtStrategy
    return this.projectsService.findAll(req.user);
  }
}
