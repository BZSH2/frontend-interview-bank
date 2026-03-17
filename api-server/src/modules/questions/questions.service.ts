import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { QueryQuestionsDto } from './dto/query-questions.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryQuestionsDto) {
    const keywordFilters = this.buildKeywordFilters(query.keyword);
    const where: Prisma.QuestionWhereInput = {
      status: 'PUBLISHED',
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(keywordFilters.length ? { AND: keywordFilters } : {}),
    };

    const [total, list] = await this.prisma.$transaction([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          title: true,
          summary: true,
          difficulty: true,
          tags: true,
          hasExplanation: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      list,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    };
  }

  async findById(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        answer: true,
        difficulty: true,
        tags: true,
        hasExplanation: true,
        explanation: {
          select: {
            content: true,
            updatedAt: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    return {
      ...question,
      explanationContent: question.explanation?.content || null,
      explanationUpdatedAt: question.explanation?.updatedAt || null,
    };
  }

  async getRequestStatus(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        hasExplanation: true,
        explanationRequest: {
          select: {
            status: true,
            supportCount: true,
            githubIssueNumber: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    return {
      hasExplanation: question.hasExplanation,
      hasRequest: Boolean(question.explanationRequest),
      status: question.explanationRequest?.status,
      supportCount: question.explanationRequest?.supportCount || 0,
      githubIssueNumber: question.explanationRequest?.githubIssueNumber || null,
    };
  }

  private buildKeywordFilters(keyword?: string): Prisma.QuestionWhereInput[] {
    if (!keyword) {
      return [];
    }

    return keyword
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((term) => ({
        OR: [
          { title: { contains: term } },
          { summary: { contains: term } },
          { content: { contains: term } },
          { answer: { contains: term } },
          { category: { name: { contains: term } } },
          {
            tags: {
              path: '$',
              string_contains: term,
            },
          },
        ],
      }));
  }
}
