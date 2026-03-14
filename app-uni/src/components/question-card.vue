<script setup lang="ts">
import { computed } from 'vue';

import type { QuestionItem } from '@/types/question';

const props = defineProps<{
  item: QuestionItem;
}>();

const difficultyLabel = computed(() => {
  const mapping = {
    EASY: '简单',
    MEDIUM: '中等',
    HARD: '困难',
  } as const;

  return mapping[props.item.difficulty] || props.item.difficulty;
});
</script>

<template>
  <navigator :url="`/pages/question-detail/index?id=${item.id}`" class="question-card">
    <view class="question-card__title">{{ item.title }}</view>
    <view class="question-card__summary">{{ item.summary || '暂无摘要' }}</view>

    <view v-if="item.tags?.length" class="question-card__tags">
      <text v-for="tag in item.tags" :key="tag" class="question-card__tag">{{ tag }}</text>
    </view>

    <view class="question-card__meta">
      <text>{{ item.category.name }}</text>
      <text>{{ difficultyLabel }}</text>
      <text>{{ item.hasExplanation ? '已有讲解' : '待补讲解' }}</text>
    </view>
  </navigator>
</template>

<style scoped lang="scss">
.question-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;

  &__title {
    font-size: 32rpx;
    font-weight: 600;
  }

  &__summary {
    color: #646a73;
    line-height: 1.6;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  &__tag {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: #f2f3f5;
    color: #4e5969;
    font-size: 22rpx;
  }

  &__meta {
    display: flex;
    gap: 16rpx;
    color: #86909c;
    font-size: 24rpx;
  }
}
</style>
