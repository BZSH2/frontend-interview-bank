<script setup lang="ts">
import type { QuestionItem } from '@/types/question';

defineProps<{
  item: QuestionItem;
}>();
</script>

<template>
  <navigator :url="`/pages/question-detail/index?id=${item.id}`" class="question-card">
    <view class="question-card__title">{{ item.title }}</view>
    <view class="question-card__summary">{{ item.summary || '暂无摘要' }}</view>
    <view class="question-card__meta">
      <text>{{ item.category.name }}</text>
      <text>{{ item.difficulty }}</text>
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

  &__meta {
    display: flex;
    gap: 16rpx;
    color: #86909c;
    font-size: 24rpx;
  }
}
</style>
