import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const explanationRoots = Array.from(
  new Set([
    path.resolve(__dirname, '..', '..', '..', 'content', 'question-explanations'),
    path.resolve(__dirname, '..', '..', 'content', 'question-explanations'),
    path.resolve(process.cwd(), 'content', 'question-explanations'),
    path.resolve(process.cwd(), '..', 'content', 'question-explanations'),
  ]),
);

export interface QuestionExplanationLookupInput {
  id: number;
  title: string;
  categoryName?: string | null;
  dbContent?: string | null;
  dbUpdatedAt?: Date | string | null;
  dbHasExplanation?: boolean;
}

export interface EffectiveQuestionExplanation {
  hasExplanation: boolean;
  content: string | null;
  updatedAt: Date | string | null;
  source: 'file' | 'database' | null;
  filePath: string | null;
}

interface ExplanationFileHit {
  absolutePath: string;
  displayPath: string;
}

function stripControlChars(input: string) {
  return Array.from(input)
    .filter((char) => char.charCodeAt(0) >= 0x20)
    .join('');
}

function normalizeFileSegment(input: string) {
  return stripControlChars(input)
    .normalize('NFKC')
    .trim()
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '');
}

function buildCandidateRelativePaths({ id, title, categoryName }: QuestionExplanationLookupInput) {
  const titleSegment = normalizeFileSegment(title);
  const categorySegment = normalizeFileSegment(categoryName || 'misc').toLowerCase() || 'misc';
  const candidates = [`${id}.md`];

  if (titleSegment) {
    candidates.push(path.join(categorySegment, `${titleSegment}.md`));
    candidates.push(`${titleSegment}.md`);
  }

  return Array.from(new Set(candidates));
}

async function findExplanationFile(
  input: QuestionExplanationLookupInput,
): Promise<ExplanationFileHit | null> {
  const relativeCandidates = buildCandidateRelativePaths(input);

  for (const root of explanationRoots) {
    for (const relativePath of relativeCandidates) {
      const absolutePath = path.join(root, relativePath);

      try {
        await access(absolutePath);
        return {
          absolutePath,
          displayPath: path.relative(path.dirname(root), absolutePath),
        };
      } catch {
        // noop
      }
    }
  }

  return null;
}

export async function resolveEffectiveExplanation(
  input: QuestionExplanationLookupInput,
): Promise<EffectiveQuestionExplanation> {
  const fileHit = await findExplanationFile(input);

  if (fileHit) {
    const content = (await readFile(fileHit.absolutePath, 'utf8')).trim();
    if (content) {
      const fileStat = await stat(fileHit.absolutePath);
      return {
        hasExplanation: true,
        content,
        updatedAt: fileStat.mtime,
        source: 'file',
        filePath: fileHit.displayPath,
      };
    }
  }

  const dbContent = input.dbContent?.trim() || null;
  if (dbContent || input.dbHasExplanation) {
    return {
      hasExplanation: true,
      content: dbContent,
      updatedAt: input.dbUpdatedAt || null,
      source: dbContent ? 'database' : null,
      filePath: null,
    };
  }

  return {
    hasExplanation: false,
    content: null,
    updatedAt: null,
    source: null,
    filePath: null,
  };
}
