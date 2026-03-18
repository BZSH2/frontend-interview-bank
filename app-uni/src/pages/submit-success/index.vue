<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

interface PageOptions {
  mode?: string;
  supportCount?: string;
  questionId?: string;
  title?: string;
  syncStatus?: 'github_synced' | 'local_only';
  message?: string;
  githubIssueNumber?: string;
}

const mode = ref('CREATED');
const supportCount = ref(1);
const questionId = ref(0);
const title = ref('');
const syncStatus = ref<'github_synced' | 'local_only'>('local_only');
const message = ref('');
const githubIssueNumber = ref<number | null>(null);

const resultText = computed(() => {
  if (message.value) {
    return message.value;
  }

  if (mode.value === 'MERGED') {
    return `该题已有申请，已累计 ${supportCount.value} 人支持。`;
  }

  return '已创建新的讲解申请。';
});

const syncHint = computed(() => {
  if (syncStatus.value === 'github_synced') {
    return githubIssueNumber.value
      ? `已同步到 GitHub Issue #${githubIssueNumber.value}`
      : '已同步到 GitHub';
  }

  return '当前先记录在本地，后续可补同步到 GitHub';
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
  syncStatus.value = pageOptions.syncStatus || 'local_only';
  message.value = pageOptions.message ? decodeURIComponent(pageOptions.message) : '';
  githubIssueNumber.value = pageOptions.githubIssueNumber
    ? Number(pageOptions.githubIssueNumber)
    : null;
});
</script>

<template>
  <view class="page">
    <view class="result-card">
      <view class="result-card__halo"></view>
      <view class="result-card__icon">🎉</view>
      <view class="result-card__title">提交成功</view>
      <view class="result-card__desc">{{ resultText }}</view>
      <view class="result-card__status" :class="`result-card__status--${syncStatus}`">
        {{ syncHint }}
      </view>
      <view v-if="title" class="result-card__sub">{{ title }}</view>

      <view class="result-card__actions">
        <button
          v-if="questionId"
          class="result-card__button result-card__button--primary"
          @click="goToQuestionDetail"
        >
          返回题目详情
        </button>
        <navigator
          class="result-card__button result-card__button--secondary"
          url="/pages/question-list/index"
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
  width: 100%;
  padding: 54rpx 34rpx;
  border-radius: 30rpx;
  background: $card-background;
  box-shadow: $card-shadow-strong;
  text-align: center;
  overflow: hidden;

  &__halo {
    position: absolute;
    top: -90rpx;
    right: -60rpx;
    width: 260rpx;
    height: 260rpx;
    border-radius: 50%;
    background: rgba(124, 77, 255, 0.12);
  }

  &__icon {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 132rpx;
    height: 132rpx;
    border-radius: 50%;
    background: $brand-gradient-soft;
    font-size: 72rpx;
  }

  &__title {
    position: relative;
    z-index: 1;
    color: $text-color;
    font-size: 38rpx;
    font-weight: 700;
  }

  &__desc {
    position: relative;
    z-index: 1;
    line-height: 1.72;
    color: $sub-text-color;
  }

  &__status {
    position: relative;
    z-index: 1;
    padding: 10rpx 20rpx;
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 600;

    &--github_synced {
      background: $soft-green-background;
      color: $success-color;
    }

    &--local_only {
      background: $warning-background;
      color: $warning-color;
    }
  }

  &__sub {
    position: relative;
    z-index: 1;
    color: $muted-text-color;
    font-size: 24rpx;
  }

  &__actions {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    width: 100%;
    margin-top: 10rpx;
  }

  &__button {
    width: 100%;
    padding: 16rpx 28rpx;
    border-radius: 999rpx;
    font-size: 28rpx;
    font-weight: 700;

    &--primary {
      background: $brand-gradient;
      color: #fff;
    }

    &--secondary {
      background: #fff;
      color: $brand-color;
      border: 1px solid rgba(124, 77, 255, 0.16);
    }
  }
}
</style>
