import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { AdminQuestionsService } from './admin-questions.service';
import { AdminCreateQuestionDto } from './dto/admin-create-question.dto';
import { AdminQueryQuestionsDto } from './dto/admin-query-questions.dto';
import { AdminUpdateQuestionDto } from './dto/admin-update-question.dto';

@Controller('admin/questions')
export class AdminQuestionsController {
  constructor(private readonly adminQuestionsService: AdminQuestionsService) {}

  @Get()
  findAll(@Query() query: AdminQueryQuestionsDto) {
    return this.adminQuestionsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.adminQuestionsService.findById(id);
  }

  @Post()
  create(@Body() dto: AdminCreateQuestionDto) {
    return this.adminQuestionsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminUpdateQuestionDto) {
    return this.adminQuestionsService.update(id, dto);
  }
}
