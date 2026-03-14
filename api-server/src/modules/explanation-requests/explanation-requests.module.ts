import { Module } from '@nestjs/common';

import { GithubModule } from '../github/github.module';
import { ExplanationRequestsController } from './explanation-requests.controller';
import { ExplanationRequestsService } from './explanation-requests.service';

@Module({
  imports: [GithubModule],
  controllers: [ExplanationRequestsController],
  providers: [ExplanationRequestsService],
})
export class ExplanationRequestsModule {}
