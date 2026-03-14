<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

interface PageOptions {
  mode?: string;
  supportCount?: string;
  questionId?: string;
  title?: string;
}

const mode = ref('CREATED');
const supportCount = ref(1);
const questionId = ref(0);
const title = ref('');

const resultText = computed(() => {
  if (mode.value === 'MERGED') {
    return `该题已有申请，已累计 ${supportCount.value} 人支持。`;
  }

  return '已创建新的讲解申请。';
});

function goToQuestionDetail() {
  if (!questionId.value) {
    return;
  }

  uni.redirectTo({
    url: `/pages/question-detail/index?id=${questionId.value}`,
  });
}

onLoad((options) => {
  const pageOptions = (options || {}) as PageOptions;
  mode.value = pageOptions.mode || 'CREATED';
  supportCount.value = Number(pageOptions.supportCount || 1);
  questionId.value = Number(pageOptions.questionId || 0);
  title.value = pageOptions.title ? decodeURIComponent(pageOptions.title) : '';
});
</script>

<template>
  <view class="page">
    <view class="result-card">
      <view class="result-card__icon">🎉</view>
      <view class="result-card__title">提交成功</view>
      <view class="result-card__desc">{{ resultText }}</view>
      <view v-if="title" class="result-card__sub">{{ title }}</view>

      <view class="result-card__actions">
        <button v-if="questionId" class="result-card__button" @click="goToQuestionDetail">
          返回题目详情
        </button>
        <navigator class="result-card__action" url="/pages/question-list/index"
          >继续浏览题库</navigator
        >
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24rpx;
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  padding: 48rpx 32rpx;
  border-radius: 24rpx;
  background: #fff;
  text-align: center;

  &__icon {
    font-size: 72rpx;
  }

  &__title {
    font-size: 36rpx;
    font-weight: 700;
  }

  &__desc {
    line-height: 1.6;
    color: #646a73;
  }

  &__sub {
    color: #86909c;
    font-size: 24rpx;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    width: 100%;
  }

  &__button,
  &__action {
    width: 100%;
    padding: 16rpx 28rpx;
    border-radius: 999rpx;
    background: #1677ff;
    color: #fff;
  }
}
</style>
