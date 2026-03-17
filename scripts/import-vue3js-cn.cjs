#!/usr/bin/env node
/* eslint-disable no-console, @typescript-eslint/no-require-imports */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.DATABASE_URL ||=
  'mysql://interview_app:interview_app_123@127.0.0.1:33307/frontend_interview_bank';

const {
  PrismaClient,
  QuestionStatus,
  ExplanationStatus,
} = require('../api-server/node_modules/@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'https://vue3js.cn';
const ENTRY_PATH = '/interview/vue/vue.html';
const DEFAULT_TAGS = ['外部题库', 'vue3js.cn'];

const CATEGORY_CONFIG = new Map([
  ['vue', { name: 'Vue', sort: 5 }],
  ['vue3', { name: 'Vue3', sort: 6 }],
  ['es6', { name: 'ES6', sort: 7 }],
  ['JavaScript', { name: 'JavaScript', sort: 8 }],
  ['css', { name: 'CSS', sort: 9 }],
  ['webpack', { name: 'Webpack', sort: 10 }],
  ['http', { name: 'HTTP', sort: 11 }],
  ['NodeJS', { name: 'Node.js', sort: 12 }],
  ['React', { name: 'React', sort: 13 }],
  ['git', { name: 'Git', sort: 14 }],
  ['linux', { name: '操作系统', sort: 15 }],
  ['typescript', { name: 'TypeScript', sort: 16 }],
  ['algorithm', { name: '算法与数据结构', sort: 17 }],
  ['applet', { name: '小程序', sort: 18 }],
  ['design', { name: '设计模式', sort: 19 }],
]);

const argv = new Set(process.argv.slice(2));
const isDryRun = argv.has('--dry-run');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;

function decodeHtml(input) {
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function normalizeLine(line) {
  return line.replace(/\s+/g, ' ').trim();
}

function truncate(text, max) {
  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function inferDifficulty(title, explanation) {
  const text = `${title} ${explanation}`;

  if (
    /源码|原理|实现|设计|优化|性能|diff|ssr|fiber|监控|安全|权限|跨域|断点续传|单点登录|treeshaking|composition|proxy/i.test(
      text,
    )
  ) {
    return 'HARD';
  }

  if (/区别|理解|场景|生命周期|通信|流程|为什么|优缺点|有哪些|怎么做|如何/i.test(text)) {
    return 'MEDIUM';
  }

  return 'EASY';
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (OpenClaw import bot)',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${url}`);
  }

  return response.text();
}

function extractLinks(indexHtml) {
  const matches = [...indexHtml.matchAll(/href="(\/interview\/[^"]+?\.html)"/g)].map(
    (item) => item[1],
  );
  const uniq = [];
  const seen = new Set();

  for (const item of matches) {
    if (!seen.has(item)) {
      seen.add(item);
      uniq.push(item);
    }
  }

  return uniq;
}

function isolateArticle(html) {
  const patterns = [
    /(?:theme-default-content\s+)?content__default">([\s\S]*?)<footer class="page-edit"/i,
    /<main class="page">\s*<div class="content__default">([\s\S]*?)<footer class="page-edit"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return '';
}

function toStructuredText(articleHtml) {
  let text = articleHtml;

  text = text.replace(/<a[^>]*class="header-anchor"[^>]*>[\s\S]*?<\/a>/gi, '');
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, (_, alt) =>
    alt ? `\n[图片: ${alt}]\n` : '\n',
  );
  text = text.replace(/<pre[^>]*><code[^>]*>/gi, '\n```\n');
  text = text.replace(/<\/code><\/pre>/gi, '\n```\n');
  text = text.replace(/<code[^>]*>/gi, '`');
  text = text.replace(/<\/code>/gi, '`');
  text = text.replace(/<h1[^>]*>/gi, '\n# ');
  text = text.replace(/<\/h1>/gi, '\n\n');
  text = text.replace(/<h2[^>]*>/gi, '\n## ');
  text = text.replace(/<\/h2>/gi, '\n\n');
  text = text.replace(/<h3[^>]*>/gi, '\n### ');
  text = text.replace(/<\/h3>/gi, '\n\n');
  text = text.replace(/<li[^>]*>/gi, '\n- ');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/(ul|ol|div|section|blockquote|table|tr|td|th)>/gi, '\n');
  text = text.replace(/<(ul|ol|div|section|blockquote|table|tr|td|th)[^>]*>/gi, '\n');
  text = text.replace(/<[^>]+>/g, ' ');
  text = decodeHtml(text);

  const rawLines = text.split('\n').map(normalizeLine).filter(Boolean);
  const lines = [];

  for (const line of rawLines) {
    if (line === '#') {
      continue;
    }

    if (lines[lines.length - 1] === line) {
      continue;
    }

    lines.push(line);
  }

  return lines;
}

function buildAnswer(lines) {
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      current = {
        heading: line.slice(3).trim(),
        body: [],
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      continue;
    }

    if (line.startsWith('### ') || line.startsWith('[图片:') || line === '```') {
      continue;
    }

    const plain = line.startsWith('- ') ? line.slice(2).trim() : line.trim();
    if (!plain) {
      continue;
    }

    if (current.body.length < 2) {
      current.body.push(plain);
    }
  }

  const bullets = sections
    .slice(0, 6)
    .map((section) => {
      const lead = section.body.find(Boolean);
      if (!lead) {
        return `- ${section.heading}`;
      }

      return `- ${section.heading}：${truncate(lead, 180)}`;
    })
    .filter(Boolean);

  if (bullets.length) {
    return `可从以下几个方面回答：\n${bullets.join('\n')}`;
  }

  const fallback = lines
    .filter((line) => !line.startsWith('#') && !line.startsWith('[图片:') && line !== '```')
    .slice(0, 5)
    .map((line) => `- ${truncate(line.replace(/^-\s*/, ''), 180)}`);

  return `可从以下几个方面回答：\n${fallback.join('\n')}`;
}

function deriveQuestionPayload(pathname, html) {
  const categoryKey = pathname.split('/')[2];
  const categoryConfig = CATEGORY_CONFIG.get(categoryKey);
  if (!categoryConfig) {
    throw new Error(`Unknown category key: ${categoryKey}`);
  }

  const article = isolateArticle(html);
  if (!article) {
    throw new Error(`Article body not found: ${pathname}`);
  }

  const lines = toStructuredText(article);
  const titleLine = lines.find((line) => line.startsWith('# '));
  if (!titleLine) {
    throw new Error(`Title not found: ${pathname}`);
  }

  const rawTitle = titleLine.slice(2).trim();
  const title = rawTitle.replace(/^面试官[:：]\s*/, '').trim();
  const bodyLines = lines.filter((line) => line !== titleLine);
  const summaryLine = bodyLines.find(
    (line) =>
      !line.startsWith('#') &&
      !line.startsWith('- ') &&
      !line.startsWith('[图片:') &&
      line !== '```',
  );
  const summary = summaryLine ? truncate(summaryLine, 120) : title;
  const explanation = bodyLines.join('\n');
  const answer = buildAnswer(bodyLines);
  const slug = pathname
    .split('/')
    .pop()
    .replace(/\.html$/, '');
  const difficulty = inferDifficulty(title, explanation);

  return {
    categoryKey,
    categoryName: categoryConfig.name,
    categorySort: categoryConfig.sort,
    title,
    summary,
    content: title,
    answer,
    explanation,
    difficulty,
    tags: [...DEFAULT_TAGS, categoryConfig.name, slug],
    sourceUrl: new URL(pathname, BASE_URL).toString(),
  };
}

async function ensureCategory(name, sort) {
  const existing = await prisma.category.findFirst({
    where: { name },
  });

  if (existing) {
    if (existing.sort !== sort) {
      return prisma.category.update({
        where: { id: existing.id },
        data: { sort },
      });
    }

    return existing;
  }

  return prisma.category.create({
    data: { name, sort },
  });
}

async function upsertQuestion(payload, categoryId) {
  const existing = await prisma.question.findFirst({
    where: {
      categoryId,
      title: payload.title,
    },
    include: {
      explanation: true,
    },
  });

  if (!existing) {
    const created = await prisma.question.create({
      data: {
        categoryId,
        title: payload.title,
        summary: payload.summary,
        content: payload.content,
        answer: payload.answer,
        difficulty: payload.difficulty,
        tags: payload.tags,
        hasExplanation: true,
        status: QuestionStatus.PUBLISHED,
        explanation: {
          create: {
            content: `${payload.explanation}\n\n来源：${payload.sourceUrl}`,
            status: ExplanationStatus.PUBLISHED,
          },
        },
      },
    });

    return { type: 'created', id: created.id };
  }

  await prisma.question.update({
    where: { id: existing.id },
    data: {
      summary: payload.summary,
      content: payload.content,
      answer: payload.answer,
      difficulty: payload.difficulty,
      tags: payload.tags,
      hasExplanation: true,
      status: QuestionStatus.PUBLISHED,
    },
  });

  if (existing.explanation) {
    await prisma.explanation.update({
      where: { questionId: existing.id },
      data: {
        content: `${payload.explanation}\n\n来源：${payload.sourceUrl}`,
        status: ExplanationStatus.PUBLISHED,
      },
    });
  } else {
    await prisma.explanation.create({
      data: {
        questionId: existing.id,
        content: `${payload.explanation}\n\n来源：${payload.sourceUrl}`,
        status: ExplanationStatus.PUBLISHED,
      },
    });
  }

  return { type: 'updated', id: existing.id };
}

async function main() {
  const indexHtml = await fetchText(new URL(ENTRY_PATH, BASE_URL));
  const allLinks = extractLinks(indexHtml);
  const targetLinks = Number.isFinite(limit) ? allLinks.slice(0, limit) : allLinks;

  console.log(`[import] discovered ${allLinks.length} pages, processing ${targetLinks.length}`);
  if (isDryRun) {
    console.log('[import] running in dry-run mode');
  }

  let created = 0;
  let updated = 0;
  let categoriesCreated = 0;
  let skipped = 0;
  const failures = [];
  const categoryCache = new Map();

  for (let i = 0; i < targetLinks.length; i += 1) {
    const pathname = targetLinks[i];
    const url = new URL(pathname, BASE_URL);
    console.log(`[import] (${i + 1}/${targetLinks.length}) ${url}`);

    try {
      const html = await fetchText(url);
      const payload = deriveQuestionPayload(pathname, html);

      let category = categoryCache.get(payload.categoryName);
      if (!category) {
        const existed = await prisma.category.findFirst({ where: { name: payload.categoryName } });
        category = await ensureCategory(payload.categoryName, payload.categorySort);
        if (!existed) {
          categoriesCreated += 1;
        }
        categoryCache.set(payload.categoryName, category);
      }

      if (isDryRun) {
        console.log(`  -> [dry-run] ${payload.categoryName} / ${payload.title}`);
        continue;
      }

      const result = await upsertQuestion(payload, category.id);
      if (result.type === 'created') {
        created += 1;
      } else {
        updated += 1;
      }
    } catch (error) {
      skipped += 1;
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ pathname, message });
      console.warn(`  -> [skip] ${pathname} :: ${message}`);
    }
  }

  console.log(
    `[import] done. categoriesCreated=${categoriesCreated}, created=${created}, updated=${updated}, skipped=${skipped}`,
  );
  if (failures.length) {
    console.log('[import] skipped pages:');
    for (const item of failures) {
      console.log(`- ${item.pathname} :: ${item.message}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
