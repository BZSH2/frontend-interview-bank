import { PrismaClient, QuestionStatus } from '@prisma/client';

import { importedVueSeriesQuestions } from './data/vue-series-questions';

const prisma = new PrismaClient();

async function ensureVueCategory() {
  const existing = await prisma.category.findFirst({
    where: { name: 'Vue' },
    orderBy: { id: 'asc' },
  });

  if (existing) return existing;

  const maxSort = await prisma.category.aggregate({
    _max: { sort: true },
  });

  return prisma.category.create({
    data: {
      name: 'Vue',
      sort: (maxSort._max.sort || 0) + 1,
    },
  });
}

async function main() {
  const vueCategory = await ensureVueCategory();
  let created = 0;
  let updated = 0;

  for (const item of importedVueSeriesQuestions) {
    const matchTitles = [item.title, ...(item.aliases || [])];
    const existing = await prisma.question.findFirst({
      where: {
        categoryId: vueCategory.id,
        OR: matchTitles.map((title) => ({ title })),
      },
      orderBy: { id: 'asc' },
    });

    const data = {
      categoryId: vueCategory.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      answer: item.answer,
      difficulty: item.difficulty,
      tags: item.tags,
      hasExplanation: item.hasExplanation,
      status: QuestionStatus.PUBLISHED,
    };

    if (existing) {
      await prisma.question.update({
        where: { id: existing.id },
        data,
      });
      updated += 1;
    } else {
      await prisma.question.create({ data });
      created += 1;
    }
  }

  console.warn(
    `Vue series import completed: created ${created}, updated ${updated}, total ${importedVueSeriesQuestions.length}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
