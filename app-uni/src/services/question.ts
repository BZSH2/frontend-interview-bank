import type { CategoryItem, QuestionDetail, QuestionItem, QuestionRequestStatus } from '@/types/question';

import { request } from './http';

export interface QueryQuestionsParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export function getCategories() {
  return request<CategoryItem[]>({
    url: '/categories',
  });
}

export function getQuestions(params: QueryQuestionsParams) {
  return request<{ list: QuestionItem[]; total: number; page: number; pageSize: number }>({
    url: '/questions',
    data: params,
  });
}

export function getQuestionDetail(id: number) {
  return request<QuestionDetail>({
    url: `/questions/${id}`,
  });
}

export function getQuestionRequestStatus(id: number) {
  return request<QuestionRequestStatus>({
    url: `/questions/${id}/request-status`,
  });
}
