import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      questionTotal,
      withExplanationCount,
      requestTotal,
      pendingRequestCount,
      localOnlyRequestCount,
    ] = await this.prisma.$transaction([
      this.prisma.question.count(),
      this.prisma.question.count({ where: { hasExplanation: true } }),
      this.prisma.explanationRequest.count(),
      this.prisma.explanationRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.explanationRequest.count({ where: { githubIssueNumber: null } }),
    ]);

    return {
      questionTotal,
      withExplanationCount,
      requestTotal,
      pendingRequestCount,
      localOnlyRequestCount,
    };
  }
}
