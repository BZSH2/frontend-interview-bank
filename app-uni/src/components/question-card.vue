<script setup lang="ts">
import type { QuestionItem } from '@/types/question';
import { getDifficultyLabel } from '@/utils/question';

const props = defineProps<{
  item: QuestionItem;
}>();

function getDifficultyClass() {
  switch (props.item.difficulty) {
    case 'EASY':
      return 'question-card__pill--easy';
    case 'HARD':
      return 'question-card__pill--hard';
    default:
      return 'question-card__pill--medium';
  }
}
</script>

<template>
  <navigator :url="`/pages/question-detail/index?id=${item.id}`" class="question-card">
    <view class="question-card__top">
      <text class="question-card__category">{{ item.category.name }}</text>
      <text
        class="question-card__status"
        :class="
          item.hasExplanation ? 'question-card__status--ready' : 'question-card__status--pending'
        "
      >
        {{ item.hasExplanation ? '系统讲解' : '待补讲解' }}
      </text>
    </view>

    <view class="question-card__title">{{ item.title }}</view>
    <view class="question-card__summary">{{
      item.summary || '暂无摘要，点击进入查看完整题目内容。'
    }}</view>

    <view v-if="item.tags?.length" class="question-card__tags">
      <text v-for="tag in item.tags" :key="tag" class="question-card__tag">{{ tag }}</text>
    </view>

    <view class="question-card__footer">
      <view class="question-card__meta">
        <text class="question-card__pill" :class="getDifficultyClass()">
          {{ getDifficultyLabel(item.difficulty) }}
        </text>
        <text class="question-card__id">题目 #{{ item.id }}</text>
      </view>
      <text class="question-card__arrow">查看</text>
    </view>
  </navigator>
</template>

<style scoped lang="scss">
.question-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 28rpx;
  background: $card-background;
  box-shadow: $card-shadow;

  &__top,
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    padding-top: 14rpx;
    border-top: 1px solid rgba(22, 28, 45, 0.06);
  }

  &__category,
  &__status,
  &__pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    font-weight: 600;
  }

  &__category {
    background: $soft-purple-background;
    color: $brand-color;
  }

  &__status {
    &--ready {
      background: $soft-green-background;
      color: $success-color;
    }

    &--pending {
      background: $warning-background;
      color: $warning-color;
    }
  }

  &__title {
    color: $text-color;
    font-size: 32rpx;
    font-weight: 700;
    line-height: 1.44;
  }

  &__summary {
    color: $sub-text-color;
    line-height: 1.74;
    font-size: 25rpx;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  &__tag {
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    background: #f6f5f2;
    color: $brand-secondary-color;
    font-size: 22rpx;
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  &__pill {
    &--easy {
      background: $soft-green-background;
      color: $success-color;
    }

    &--medium {
      background: $soft-blue-background;
      color: $brand-secondary-color;
    }

    &--hard {
      background: $soft-pink-background;
      color: $accent-pink-color;
    }
  }

  &__id {
    color: $muted-text-color;
    font-size: 22rpx;
  }

  &__arrow {
    flex-shrink: 0;
    color: $brand-color;
    font-size: 24rpx;
    font-weight: 600;
  }
}
</style>
