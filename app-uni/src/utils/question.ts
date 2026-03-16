import type { Difficulty } from '@/types/question';

const difficultyLabelMap: Record<Difficulty, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
};

export function getDifficultyLabel(difficulty: Difficulty | string) {
  if (difficulty in difficultyLabelMap) {
    return difficultyLabelMap[difficulty as Difficulty];
  }

  return difficulty;
}

export function normalizeKeyword(keyword?: string) {
  if (typeof keyword !== 'string') {
    return '';
  }

  return keyword.trim().replace(/\s+/g, ' ');
}
