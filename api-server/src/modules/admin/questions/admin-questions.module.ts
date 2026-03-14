import { Module } from '@nestjs/common';

import { AdminQuestionsController } from './admin-questions.controller';
import { AdminQuestionsService } from './admin-questions.service';

@Module({
  controllers: [AdminQuestionsController],
  providers: [AdminQuestionsService],
})
export class AdminQuestionsModule {}
