<script setup lang="ts">
import { computed, onMounted } from 'vue';

import QuestionCard from '@/components/question-card.vue';
import { useQuestionStore } from '@/stores/question';

const questionStore = useQuestionStore();

const stats = computed(() => [
  { label: '分类', value: questionStore.categories.length || '--' },
  { label: '题目', value: questionStore.questions.length || '--' },
]);

async function loadHome() {
  await questionStore.bootstrapHome();
}

onMounted(loadHome);
</script>

<template>
  <view class="page page-home">
    <view class="hero-card">
      <view class="hero-card__eyebrow">Front-end Interview Bank</view>
      <view class="hero-card__title">前端面试题库</view>
      <view class="hero-card__desc">
        覆盖基础题、场景题和系统讲解沉淀，用更清晰、克制的方式帮助你准备面试。
      </view>

      <view class="hero-card__stats">
        <view v-for="item in stats" :key="item.label" class="hero-stat">
          <view class="hero-stat__value">{{ item.value }}</view>
          <view class="hero-stat__label">{{ item.label }}</view>
        </view>
      </view>

      <view class="hero-card__actions">
        <navigator
          class="hero-card__button hero-card__button--primary"
          url="/pages/question-list/index"
          >进入题库</navigator
        >
        <navigator
          class="hero-card__button hero-card__button--secondary"
          url="/pages/question-list/index"
          >按分类浏览</navigator
        >
      </view>
    </view>

    <view class="section-card section-card--nav">
      <view class="section-card__header">
        <view>
          <view class="section-card__eyebrow">Categories</view>
          <view class="section-card__title">分类导航</view>
        </view>
        <navigator class="section-card__link" url="/pages/question-list/index">进入列表</navigator>
      </view>

      <view v-if="questionStore.loading" class="section-card__state">分类加载中...</view>
      <scroll-view v-else class="category-nav-scroll" scroll-x>
        <view class="category-nav-row">
          <navigator
            class="category-nav-item category-nav-item--active"
            url="/pages/question-list/index"
          >
            全部
          </navigator>
          <navigator
            v-for="category in questionStore.categories"
            :key="category.id"
            :url="`/pages/question-list/index?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`"
            class="category-nav-item"
          >
            {{ category.name }}
          </navigator>
        </view>
      </scroll-view>
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
}

.hero-card,
.section-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 30rpx;
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 28rpx;
  background: $card-background;
  box-shadow: $card-shadow;
}

.hero-card {
  &__eyebrow {
    color: $brand-secondary-color;
    font-size: 22rpx;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__title {
    color: $text-color;
    font-size: 44rpx;
    font-weight: 700;
    line-height: 1.18;
  }

  &__desc {
    max-width: 90%;
    color: $sub-text-color;
    font-size: 26rpx;
    line-height: 1.76;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
    margin-top: 2rpx;
  }

  &__button {
    padding: 16rpx 28rpx;
    border-radius: 999rpx;
    font-size: 26rpx;
    font-weight: 600;

    &--primary {
      background: $brand-gradient;
      color: #fff;
    }

    &--secondary {
      background: #fff;
      color: $brand-color;
      border: 1px solid rgba(22, 28, 45, 0.08);
    }
  }
}

.hero-stat {
  padding: 18rpx 20rpx;
  border: 1px solid rgba(22, 28, 45, 0.05);
  border-radius: 20rpx;
  background: #faf9f7;

  &__value {
    color: $text-color;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 1.1;
  }

  &__label {
    margin-top: 8rpx;
    color: $muted-text-color;
    font-size: 22rpx;
  }
}

.section-card {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  &__eyebrow {
    color: $brand-secondary-color;
    font-size: 22rpx;
    font-weight: 600;
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

  &--nav {
    gap: 20rpx;
  }

  &__state {
    padding: 18rpx 0;
    color: $muted-text-color;
  }
}

.category-nav-scroll {
  white-space: nowrap;
}

.category-nav-row {
  position: relative;
  display: inline-flex;
  gap: 28rpx;
  min-width: 100%;
  padding-bottom: 6rpx;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: rgba(22, 28, 45, 0.08);
  }
}

.category-nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 8rpx 0 18rpx;
  color: $muted-text-color;
  font-size: 26rpx;
  font-weight: 500;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 4rpx;
    border-radius: 999rpx;
    background: transparent;
  }

  &--active {
    color: $brand-color;
    font-weight: 700;

    &::after {
      background: $brand-color;
    }
  }
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
