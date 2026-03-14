import { defineStore } from 'pinia';
import { ref } from 'vue';

import { getCategories, getQuestions } from '@/services/question';
import type { CategoryItem, QuestionItem } from '@/types/question';

export const useQuestionStore = defineStore('question', () => {
  const categories = ref<CategoryItem[]>([]);
  const questions = ref<QuestionItem[]>([]);
  const loading = ref(false);

  async function bootstrapHome() {
    loading.value = true;
    try {
      const [categoryResult, questionResult] = await Promise.all([
        getCategories(),
        getQuestions({ page: 1, pageSize: 10 }),
      ]);
      categories.value = categoryResult;
      questions.value = questionResult.list;
    } finally {
      loading.value = false;
    }
  }

  return {
    categories,
    questions,
    loading,
    bootstrapHome,
  };
});
