import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { Difficulty, ExplanationStatus, QuestionStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AdminCreateQuestionDto } from './dto/admin-create-question.dto';
import { AdminQueryQuestionsDto } from './dto/admin-query-questions.dto';
import { AdminUpdateQuestionDto } from './dto/admin-update-question.dto';

@Injectable()
export class AdminQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminQueryQuestionsDto) {
    const where: Prisma.QuestionWhereInput = {
      ...(query.keyword
        ? {
            OR: [{ title: { contains: query.keyword } }, { summary: { contains: query.keyword } }],
          }
        : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(typeof query.hasExplanation === 'boolean'
        ? { hasExplanation: query.hasExplanation }
        : {}),
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
          status: true,
          tags: true,
          hasExplanation: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          explanation: {
            select: {
              updatedAt: true,
            },
          },
          explanationRequest: {
            select: {
              status: true,
              supportCount: true,
              githubIssueNumber: true,
            },
          },
        },
      }),
    ]);

    return {
      list: list.map((item) => ({
        ...item,
        explanationUpdatedAt: item.explanation?.updatedAt || null,
        requestSummary: item.explanationRequest
          ? {
              status: item.explanationRequest.status,
              supportCount: item.explanationRequest.supportCount,
              syncStatus: item.explanationRequest.githubIssueNumber
                ? 'github_synced'
                : 'local_only',
              githubIssueNumber: item.explanationRequest.githubIssueNumber,
            }
          : null,
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async findById(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        title: true,
        summary: true,
        content: true,
        answer: true,
        difficulty: true,
        tags: true,
        hasExplanation: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        explanation: {
          select: {
            content: true,
            status: true,
            updatedAt: true,
          },
        },
        explanationRequest: {
          select: {
            id: true,
            status: true,
            supportCount: true,
            githubIssueNumber: true,
            updatedAt: true,
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
      explanationStatus: question.explanation?.status || null,
      explanationUpdatedAt: question.explanation?.updatedAt || null,
      requestSummary: question.explanationRequest
        ? {
            id: question.explanationRequest.id,
            status: question.explanationRequest.status,
            supportCount: question.explanationRequest.supportCount,
            githubIssueNumber: question.explanationRequest.githubIssueNumber,
            syncStatus: question.explanationRequest.githubIssueNumber
              ? 'github_synced'
              : 'local_only',
            updatedAt: question.explanationRequest.updatedAt,
          }
        : null,
    };
  }

  async create(dto: AdminCreateQuestionDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const explanationContent = dto.explanationContent?.trim();
      const question = await tx.question.create({
        data: {
          categoryId: dto.categoryId,
          title: dto.title,
          summary: dto.summary,
          content: dto.content,
          answer: dto.answer,
          difficulty: dto.difficulty || Difficulty.EASY,
          tags: dto.tags || undefined,
          hasExplanation: Boolean(explanationContent),
          status: dto.status || QuestionStatus.PUBLISHED,
        },
      });

      if (explanationContent) {
        await tx.explanation.create({
          data: {
            questionId: question.id,
            content: explanationContent,
            status: dto.explanationStatus || ExplanationStatus.PUBLISHED,
          },
        });
      }

      return question;
    });

    return this.findById(result.id);
  }

  async update(id: number, dto: AdminUpdateQuestionDto) {
    const existing = await this.prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        explanation: {
          select: {
            questionId: true,
          },
        },
        explanationRequest: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('题目不存在');
    }

    await this.prisma.$transaction(async (tx) => {
      const questionData: Prisma.QuestionUpdateInput = {
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.answer !== undefined ? { answer: dto.answer } : {}),
        ...(dto.difficulty ? { difficulty: dto.difficulty } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags || undefined } : {}),
      };

      if (dto.explanationContent !== undefined) {
        const explanationContent = dto.explanationContent.trim();
        if (explanationContent) {
          questionData.hasExplanation = true;
          await tx.explanation.upsert({
            where: { questionId: id },
            create: {
              questionId: id,
              content: explanationContent,
              status: dto.explanationStatus || ExplanationStatus.PUBLISHED,
            },
            update: {
              content: explanationContent,
              ...(dto.explanationStatus ? { status: dto.explanationStatus } : {}),
            },
          });

          if (existing.explanationRequest?.id) {
            await tx.explanationRequest.update({
              where: { id: existing.explanationRequest.id },
              data: {
                status: 'DONE',
              },
            });
          }
        } else {
          questionData.hasExplanation = false;
          if (existing.explanation?.questionId) {
            await tx.explanation.delete({
              where: { questionId: id },
            });
          }
        }
      } else if (dto.explanationStatus && existing.explanation?.questionId) {
        await tx.explanation.update({
          where: { questionId: id },
          data: {
            status: dto.explanationStatus,
          },
        });
      }

      if (Object.keys(questionData).length > 0) {
        await tx.question.update({
          where: { id },
          data: questionData,
        });
      }
    });

    return this.findById(id);
  }
}
