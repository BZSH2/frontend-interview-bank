import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';

import {
  buildGithubIssueBody,
  buildGithubIssueTitle,
  type GithubExplanationIssuePayload,
} from './github.helpers';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly owner: string | undefined;
  private readonly repo: string | undefined;
  private readonly token: string | undefined;
  private readonly octokit: Octokit | null;

  constructor(private readonly configService: ConfigService) {
    this.owner = this.configService.get<string>('GITHUB_OWNER');
    this.repo = this.configService.get<string>('GITHUB_REPO');
    this.token = this.configService.get<string>('GITHUB_TOKEN');
    this.octokit = this.token ? new Octokit({ auth: this.token }) : null;
  }

  isConfigured() {
    return Boolean(this.owner && this.repo && this.token && this.octokit);
  }

  getRepositoryInfo() {
    return {
      owner: this.owner,
      repo: this.repo,
      enabled: this.isConfigured(),
    };
  }

  async createExplanationIssue(input: GithubExplanationIssuePayload) {
    if (!this.isConfigured() || !this.octokit || !this.owner || !this.repo) {
      this.logger.warn('GitHub repository or token is not configured. Skip creating issue.');
      return null;
    }

    const issue = await this.octokit.rest.issues.create({
      owner: this.owner,
      repo: this.repo,
      title: buildGithubIssueTitle(input),
      labels: ['explanation-request', 'frontend', 'pending'],
      body: buildGithubIssueBody(input),
    });

    return {
      issueNumber: issue.data.number,
      issueId: String(issue.data.id),
      htmlUrl: issue.data.html_url,
    };
  }

  async createSupportComment(issueNumber: number, supportCount: number) {
    if (!this.isConfigured() || !this.octokit || !this.owner || !this.repo) {
      return;
    }

    await this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body: `新增一条支持记录，当前累计支持数：**${supportCount}**。`,
    });
  }
}
