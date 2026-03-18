<script setup lang="ts">
import { computed, onMounted } from 'vue';

import QuestionCard from '@/components/question-card.vue';
import { useQuestionStore } from '@/stores/question';

const questionStore = useQuestionStore();

const stats = computed(() => [
  { label: '主题分类', value: questionStore.categories.length || '--' },
  { label: '首页题目', value: questionStore.questions.length || '--' },
]);

async function loadHome() {
  await questionStore.bootstrapHome();
}

onMounted(loadHome);
</script>

<template>
  <view class="page page-home">
    <view class="page-home__hero">
      <view class="page-home__badge">✨ Young UI · 面试准备更轻快</view>
      <view class="page-home__title">前端面试题库</view>
      <view class="page-home__desc">
        覆盖高频基础题、场景题、系统讲解申请与持续内容沉淀，做成更适合刷题和复盘的移动端体验。
      </view>

      <view class="page-home__stats">
        <view v-for="item in stats" :key="item.label" class="hero-stat">
          <view class="hero-stat__value">{{ item.value }}</view>
          <view class="hero-stat__label">{{ item.label }}</view>
        </view>
      </view>

      <view class="page-home__actions">
        <navigator class="page-home__cta page-home__cta--primary" url="/pages/question-list/index"
          >开始刷题</navigator
        >
        <navigator class="page-home__cta page-home__cta--secondary" url="/pages/question-list/index"
          >按分类浏览</navigator
        >
      </view>
    </view>

    <view class="section-card">
      <view class="section-card__header">
        <view>
          <view class="section-card__eyebrow">Browse</view>
          <view class="section-card__title">热门分类</view>
        </view>
        <navigator class="section-card__link" url="/pages/question-list/index">看全部</navigator>
      </view>

      <view v-if="questionStore.loading" class="section-card__state">分类加载中...</view>
      <view v-else class="section-card__chips">
        <navigator
          v-for="category in questionStore.categories"
          :key="category.id"
          :url="`/pages/question-list/index?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`"
          class="chip"
        >
          {{ category.name }}
        </navigator>
      </view>
    </view>

    <view class="section-card">
      <view class="section-card__header">
        <view>
          <view class="section-card__eyebrow">Latest</view>
          <view class="section-card__title">最新题目</view>
        </view>
      </view>

      <view v-if="questionStore.loading" class="section-card__state">题目加载中...</view>
      <view v-else-if="questionStore.error" class="error-card">
        <view class="error-card__text">{{ questionStore.error }}</view>
        <button class="error-card__button" @click="loadHome">重新加载</button>
      </view>
      <view v-else-if="questionStore.questions.length === 0" class="section-card__state"
        >暂无题目</view
      >
      <view v-else class="question-list">
        <QuestionCard v-for="item in questionStore.questions" :key="item.id" :item="item" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  padding: 24rpx;
}

.page-home {
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  &__hero {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 36rpx 34rpx;
    border-radius: 32rpx;
    background: $brand-gradient;
    box-shadow: $card-shadow-strong;
    color: #fff;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: -80rpx;
      right: -40rpx;
      width: 220rpx;
      height: 220rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.14);
    }
  }

  &__badge {
    align-self: flex-start;
    padding: 10rpx 20rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.18);
    font-size: 22rpx;
    letter-spacing: 0.04em;
  }

  &__title {
    position: relative;
    z-index: 1;
    font-size: 44rpx;
    font-weight: 700;
    line-height: 1.2;
  }

  &__desc {
    position: relative;
    z-index: 1;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.72;
    font-size: 26rpx;
  }

  &__stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
  }

  &__actions {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
    margin-top: 6rpx;
  }

  &__cta {
    padding: 16rpx 28rpx;
    border-radius: 999rpx;
    font-weight: 600;
    font-size: 26rpx;

    &--primary {
      background: #fff;
      color: $brand-color;
    }

    &--secondary {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }
  }
}

.hero-stat {
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.14);

  &__value {
    font-size: 34rpx;
    font-weight: 700;
    line-height: 1.1;
  }

  &__label {
    margin-top: 8rpx;
    color: rgba(255, 255, 255, 0.84);
    font-size: 22rpx;
  }
}

.section-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 28rpx;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 28rpx;
  background: $card-background;
  box-shadow: $card-shadow;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  &__eyebrow {
    color: $brand-color;
    font-size: 22rpx;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__title {
    margin-top: 6rpx;
    color: $text-color;
    font-size: 32rpx;
    font-weight: 700;
  }

  &__link {
    color: $brand-color;
    font-size: 24rpx;
    font-weight: 600;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
  }

  &__state {
    padding: 20rpx 0;
    color: $muted-text-color;
  }
}

.chip {
  padding: 14rpx 22rpx;
  border: 1px solid rgba(124, 77, 255, 0.14);
  border-radius: 999rpx;
  background: $brand-gradient-soft;
  color: $brand-color;
  font-size: 24rpx;
  font-weight: 600;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.error-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: $danger-background;

  &__text {
    color: $danger-color;
    line-height: 1.68;
  }

  &__button {
    align-self: flex-start;
    padding: 0 28rpx;
    border-radius: 999rpx;
    background: #fff;
    color: $danger-color;
    font-size: 24rpx;
  }
}
</style>
