<script setup lang="ts">
import { onMounted, ref } from 'vue';

import QuestionCard from '@/components/question-card.vue';
import { getQuestions } from '@/services/question';
import type { QuestionItem } from '@/types/question';

const loading = ref(false);
const keyword = ref('');
const questions = ref<QuestionItem[]>([]);

async function loadQuestions() {
  loading.value = true;
  try {
    const result = await getQuestions({
      page: 1,
      pageSize: 20,
      keyword: keyword.value || undefined,
    });
    questions.value = result.list;
  } finally {
    loading.value = false;
  }
}

onMounted(loadQuestions);
</script>

<template>
  <view class="page">
    <view class="toolbar">
      <input v-model="keyword" class="toolbar__input" placeholder="搜索题目 / 标签 / 关键词" />
      <button class="toolbar__button toolbar__button--primary" size="mini" @click="loadQuestions">
        搜索
      </button>
    </view>

    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="questions.length === 0" class="state">暂无数据</view>
    <view v-else class="question-list">
      <QuestionCard v-for="item in questions" :key="item.id" :item="item" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx;
}

.toolbar {
  display: flex;
  gap: 16rpx;

  &__input {
    flex: 1;
    padding: 20rpx 24rpx;
    border-radius: 16rpx;
    background: #fff;
  }

  &__button {
    &--primary {
      background: #1677ff;
      color: #fff;
    }
  }
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.state {
  padding: 48rpx 0;
  text-align: center;
  color: #86909c;
}
</style>
