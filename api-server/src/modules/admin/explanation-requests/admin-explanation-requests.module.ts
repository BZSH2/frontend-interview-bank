import { Module } from '@nestjs/common';

import { GithubModule } from '../../github/github.module';
import { AdminExplanationRequestsController } from './admin-explanation-requests.controller';
import { AdminExplanationRequestsService } from './admin-explanation-requests.service';

@Module({
  imports: [GithubModule],
  controllers: [AdminExplanationRequestsController],
  providers: [AdminExplanationRequestsService],
})
export class AdminExplanationRequestsModule {}
