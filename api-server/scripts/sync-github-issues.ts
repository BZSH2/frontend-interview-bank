import fs from 'node:fs';
import path from 'node:path';

import { Octokit } from '@octokit/rest';
import { PrismaClient } from '@prisma/client';

import { buildGithubIssueBody, buildGithubIssueTitle } from '../src/modules/github/github.helpers';

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const index = line.indexOf('=');
    if (index === -1) {
      continue;
    }

    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function bootstrapEnv() {
  const cwd = process.cwd();
  loadEnvFile(path.join(cwd, '.env'));
  loadEnvFile(path.join(cwd, '.env.local'));
}

async function main() {
  bootstrapEnv();

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const dryRun = process.argv.includes('--dry-run');

  if (!owner || !repo) {
    throw new Error('Missing GITHUB_OWNER or GITHUB_REPO');
  }

  if (!dryRun && !token) {
    throw new Error('Missing GITHUB_TOKEN. Use --dry-run to preview only.');
  }

  const prisma = new PrismaClient();
  const pending = await prisma.explanationRequest.findMany({
    where: {
      githubIssueNumber: null,
    },
    orderBy: [{ createdAt: 'asc' }],
    include: {
      question: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  console.warn(`Found ${pending.length} unsynced explanation requests.`);

  if (pending.length === 0) {
    await prisma.$disconnect();
    return;
  }

  if (dryRun) {
    for (const item of pending) {
      console.warn(
        JSON.stringify(
          {
            requestId: item.id,
            questionId: item.questionId,
            title: buildGithubIssueTitle({
              questionId: item.question.id,
              title: item.question.title,
              note: item.note || undefined,
              source: item.source,
            }),
          },
          null,
          2,
        ),
      );
    }
    await prisma.$disconnect();
    return;
  }

  const octokit = new Octokit({ auth: token });

  for (const item of pending) {
    const payload = {
      questionId: item.question.id,
      title: item.question.title,
      note: item.note || undefined,
      source: item.source,
    };

    const issue = await octokit.rest.issues.create({
      owner,
      repo,
      title: buildGithubIssueTitle(payload),
      labels: ['explanation-request', 'frontend', 'pending'],
      body: buildGithubIssueBody(payload),
    });

    await prisma.explanationRequest.update({
      where: { id: item.id },
      data: {
        githubIssueNumber: issue.data.number,
        githubIssueId: String(issue.data.id),
      },
    });

    console.warn(
      `Synced request #${item.id} -> GitHub issue #${issue.data.number} (${issue.data.html_url})`,
    );
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
