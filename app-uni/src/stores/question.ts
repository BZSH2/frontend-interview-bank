import { defineStore } from 'pinia';
import { ref } from 'vue';

import { getCategories, getQuestions } from '@/services/question';
import type { CategoryItem, QuestionItem } from '@/types/question';

export const useQuestionStore = defineStore('question', () => {
  const categories = ref<CategoryItem[]>([]);
  const questions = ref<QuestionItem[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function bootstrapHome() {
    loading.value = true;
    error.value = '';

    try {
      const [categoryResult, questionResult] = await Promise.all([
        getCategories(),
        getQuestions({ page: 1, pageSize: 10 }),
      ]);
      categories.value = categoryResult;
      questions.value = questionResult.list;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载首页数据失败';
    } finally {
      loading.value = false;
    }
  }

  return {
    categories,
    questions,
    loading,
    error,
    bootstrapHome,
  };
});
