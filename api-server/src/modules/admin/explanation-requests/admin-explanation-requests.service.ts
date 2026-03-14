import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { RequestStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { GithubService } from '../../github/github.service';
import { AdminQueryExplanationRequestsDto } from './dto/admin-query-explanation-requests.dto';

@Injectable()
export class AdminExplanationRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubService: GithubService,
  ) {}

  async findAll(query: AdminQueryExplanationRequestsDto) {
    const where: Prisma.ExplanationRequestWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.syncStatus === 'github_synced'
        ? { githubIssueNumber: { not: null } }
        : query.syncStatus === 'local_only'
          ? { githubIssueNumber: null }
          : {}),
      ...(query.keyword
        ? {
            OR: [
              { note: { contains: query.keyword } },
              { question: { title: { contains: query.keyword } } },
            ],
          }
        : {}),
    };

    const [total, list] = await this.prisma.$transaction([
      this.prisma.explanationRequest.count({ where }),
      this.prisma.explanationRequest.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          questionId: true,
          note: true,
          source: true,
          status: true,
          supportCount: true,
          githubIssueNumber: true,
          createdAt: true,
          updatedAt: true,
          lastSubmittedAt: true,
          question: {
            select: {
              id: true,
              title: true,
              hasExplanation: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      list: list.map((item) => ({
        ...item,
        syncStatus: item.githubIssueNumber ? 'github_synced' : 'local_only',
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async updateStatus(id: number, status: RequestStatus) {
    const request = await this.prisma.explanationRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!request) {
      throw new NotFoundException('讲解申请不存在');
    }

    const updated = await this.prisma.explanationRequest.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        githubIssueNumber: true,
        supportCount: true,
        updatedAt: true,
      },
    });

    return {
      ...updated,
      syncStatus: updated.githubIssueNumber ? 'github_synced' : 'local_only',
    };
  }

  async syncToGithub(id: number) {
    const request = await this.prisma.explanationRequest.findUnique({
      where: { id },
      select: {
        id: true,
        questionId: true,
        note: true,
        source: true,
        githubIssueNumber: true,
        githubIssueId: true,
        question: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('讲解申请不存在');
    }

    if (request.githubIssueNumber) {
      return {
        synced: true,
        syncStatus: 'github_synced',
        githubIssueNumber: request.githubIssueNumber,
        githubIssueId: request.githubIssueId,
        message: '该申请已同步到 GitHub，无需重复同步',
      };
    }

    const issue = await this.githubService.createExplanationIssue({
      questionId: request.question.id,
      title: request.question.title,
      note: request.note || undefined,
      source: request.source,
    });

    if (!issue) {
      return {
        synced: false,
        syncStatus: 'local_only',
        githubIssueNumber: null,
        message: '当前未配置 GitHub 自动同步，请先配置 GITHUB_TOKEN',
      };
    }

    const updated = await this.prisma.explanationRequest.update({
      where: { id },
      data: {
        githubIssueNumber: issue.issueNumber,
        githubIssueId: issue.issueId,
      },
      select: {
        id: true,
        githubIssueNumber: true,
        githubIssueId: true,
      },
    });

    return {
      synced: true,
      syncStatus: 'github_synced',
      githubIssueNumber: updated.githubIssueNumber,
      githubIssueId: updated.githubIssueId,
      message: '已成功同步到 GitHub',
      htmlUrl: issue.htmlUrl,
    };
  }
}
