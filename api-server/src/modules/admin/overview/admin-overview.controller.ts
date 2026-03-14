import { Controller, Get } from '@nestjs/common';

import { AdminOverviewService } from './admin-overview.service';

@Controller('admin/overview')
export class AdminOverviewController {
  constructor(private readonly adminOverviewService: AdminOverviewService) {}

  @Get()
  getOverview() {
    return this.adminOverviewService.getOverview();
  }
}
