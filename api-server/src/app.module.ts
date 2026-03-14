import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CategoriesModule } from './modules/categories/categories.module';
import { ExplanationRequestsModule } from './modules/explanation-requests/explanation-requests.module';
import { GithubModule } from './modules/github/github.module';
import { HealthModule } from './modules/health/health.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    GithubModule,
    HealthModule,
    CategoriesModule,
    QuestionsModule,
    ExplanationRequestsModule,
  ],
})
export class AppModule {}
