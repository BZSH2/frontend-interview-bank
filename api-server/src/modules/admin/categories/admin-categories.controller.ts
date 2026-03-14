import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { AdminAuthGuard } from '../admin-auth.guard';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCreateCategoryDto } from './dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dto/admin-update-category.dto';

@UseGuards(AdminAuthGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly adminCategoriesService: AdminCategoriesService) {}

  @Get()
  findAll() {
    return this.adminCategoriesService.findAll();
  }

  @Post()
  create(@Body() dto: AdminCreateCategoryDto) {
    return this.adminCategoriesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminUpdateCategoryDto) {
    return this.adminCategoriesService.update(id, dto);
  }
}
