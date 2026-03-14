import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { AdminExplanationRequestsService } from './admin-explanation-requests.service';
import { AdminQueryExplanationRequestsDto } from './dto/admin-query-explanation-requests.dto';
import { AdminUpdateExplanationRequestStatusDto } from './dto/admin-update-explanation-request-status.dto';

@Controller('admin/explanation-requests')
export class AdminExplanationRequestsController {
  constructor(private readonly adminExplanationRequestsService: AdminExplanationRequestsService) {}

  @Get()
  findAll(@Query() query: AdminQueryExplanationRequestsDto) {
    return this.adminExplanationRequestsService.findAll(query);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateExplanationRequestStatusDto,
  ) {
    return this.adminExplanationRequestsService.updateStatus(id, dto.status);
  }

  @Post(':id/sync')
  syncToGithub(@Param('id', ParseIntPipe) id: number) {
    return this.adminExplanationRequestsService.syncToGithub(id);
  }
}
