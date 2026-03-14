import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { QueryQuestionsDto } from './dto/query-questions.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query() query: QueryQuestionsDto) {
    return this.questionsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findById(id);
  }

  @Get(':id/request-status')
  getRequestStatus(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.getRequestStatus(id);
  }
}
