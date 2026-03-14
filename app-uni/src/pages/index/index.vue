<script setup lang="ts">
import { onMounted } from 'vue';

import QuestionCard from '@/components/question-card.vue';
import { useQuestionStore } from '@/stores/question';

const questionStore = useQuestionStore();

onMounted(async () => {
  await questionStore.bootstrapHome();
});
</script>

<template>
  <view class="page page-home">
    <view class="page-home__hero">
      <view class="page-home__title">前端面试题库</view>
      <view class="page-home__desc">覆盖基础题、场景题、系统讲解申请与后续内容沉淀。</view>
      <navigator class="page-home__cta" url="/pages/question-list/index">进入题库</navigator>
    </view>

    <view class="section">
      <view class="section__title">分类</view>
      <view class="section__chips">
        <view v-for="category in questionStore.categories" :key="category.id" class="chip">
          {{ category.name }}
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section__title">热门题目</view>
      <view class="question-list">
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
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 32rpx;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #1677ff, #69b1ff);
    color: #fff;
  }

  &__title {
    font-size: 40rpx;
    font-weight: 700;
  }

  &__desc {
    line-height: 1.6;
  }

  &__cta {
    align-self: flex-start;
    padding: 14rpx 24rpx;
    border-radius: 999rpx;
    background: #fff;
    color: #1677ff;
    font-weight: 600;
  }
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
}

.chip {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: #e8f3ff;
  color: #1677ff;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
</style>
