import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { GithubService } from '../github/github.service';
import { CreateExplanationRequestDto } from './dto/create-explanation-request.dto';

interface RequestMeta {
  userKey?: string;
  ip?: string;
}

@Injectable()
export class ExplanationRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubService: GithubService,
  ) {}

  async create(dto: CreateExplanationRequestDto, meta: RequestMeta) {
    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
      select: {
        id: true,
        title: true,
        hasExplanation: true,
        explanationRequest: {
          select: {
            id: true,
            supportCount: true,
            githubIssueNumber: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    if (question.hasExplanation) {
      throw new BadRequestException('该题已有讲解，无需重复申请');
    }

    if (question.explanationRequest) {
      const supportCount = question.explanationRequest.supportCount + 1;
      const isGithubSynced = Boolean(question.explanationRequest.githubIssueNumber);

      await this.prisma.$transaction([
        this.prisma.explanationRequest.update({
          where: { id: question.explanationRequest.id },
          data: {
            supportCount,
            lastSubmittedAt: new Date(),
            note: dto.note || undefined,
          },
        }),
        this.prisma.explanationRequestLog.create({
          data: {
            requestId: question.explanationRequest.id,
            questionId: dto.questionId,
            userKey: meta.userKey,
            ip: meta.ip,
            note: dto.note,
            source: dto.source,
          },
        }),
      ]);

      if (question.explanationRequest.githubIssueNumber) {
        await this.githubService.createSupportComment(
          question.explanationRequest.githubIssueNumber,
          supportCount,
        );
      }

      return {
        success: true,
        mode: 'MERGED',
        syncStatus: isGithubSynced ? 'github_synced' : 'local_only',
        message: isGithubSynced
          ? '该题已有讲解申请，已为你登记支持'
          : '该题已有本地申请记录，已为你登记支持，后续可再同步到 GitHub',
        githubIssueNumber: question.explanationRequest.githubIssueNumber || null,
        supportCount,
      };
    }

    const issue = await this.githubService.createExplanationIssue({
      questionId: question.id,
      title: question.title,
      note: dto.note,
      source: dto.source,
    });

    const request = await this.prisma.explanationRequest.create({
      data: {
        questionId: question.id,
        githubIssueNumber: issue?.issueNumber,
        githubIssueId: issue?.issueId,
        note: dto.note,
        source: dto.source,
        status: 'PENDING',
        supportCount: 1,
        logs: {
          create: {
            questionId: question.id,
            userKey: meta.userKey,
            ip: meta.ip,
            note: dto.note,
            source: dto.source,
          },
        },
      },
    });

    const isGithubSynced = Boolean(issue?.issueNumber);

    return {
      success: true,
      mode: 'CREATED',
      syncStatus: isGithubSynced ? 'github_synced' : 'local_only',
      message: isGithubSynced
        ? '已创建新的讲解申请，并同步到 GitHub'
        : '已记录新的讲解申请；当前未配置 GitHub 自动同步，后续可补同步',
      githubIssueNumber: request.githubIssueNumber || null,
      supportCount: request.supportCount,
    };
  }
}
