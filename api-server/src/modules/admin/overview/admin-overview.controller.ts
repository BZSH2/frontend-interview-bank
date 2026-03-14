import { Controller, Get, UseGuards } from '@nestjs/common';

import { AdminAuthGuard } from '../admin-auth.guard';
import { AdminOverviewService } from './admin-overview.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/overview')
export class AdminOverviewController {
  constructor(private readonly adminOverviewService: AdminOverviewService) {}

  @Get()
  getOverview() {
    return this.adminOverviewService.getOverview();
  }
}
