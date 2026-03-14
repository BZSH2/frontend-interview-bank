import { Module } from '@nestjs/common';

import { AdminAuthGuard } from './admin-auth.guard';
import { AdminCategoriesModule } from './categories/admin-categories.module';
import { AdminExplanationRequestsModule } from './explanation-requests/admin-explanation-requests.module';
import { AdminOverviewModule } from './overview/admin-overview.module';
import { AdminQuestionsModule } from './questions/admin-questions.module';

@Module({
  imports: [
    AdminOverviewModule,
    AdminCategoriesModule,
    AdminQuestionsModule,
    AdminExplanationRequestsModule,
  ],
  providers: [AdminAuthGuard],
  exports: [AdminAuthGuard],
})
export class AdminModule {}
