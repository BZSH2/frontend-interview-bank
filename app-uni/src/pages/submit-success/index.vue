<script setup lang="ts">
interface PageOptions {
  mode?: string;
  supportCount?: string;
}

function getPageOptions() {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1] as { options?: PageOptions } | undefined;
  return current?.options || {};
}

const pageOptions = getPageOptions();
const mode = pageOptions.mode || 'CREATED';
const supportCount = Number(pageOptions.supportCount || 1);
</script>

<template>
  <view class="page">
    <view class="result-card">
      <view class="result-card__icon">🎉</view>
      <view class="result-card__title">提交成功</view>
      <view class="result-card__desc">
        {{
          mode === 'MERGED'
            ? `该题已有申请，已累计 ${supportCount} 人支持。`
            : '已创建新的讲解申请。'
        }}
      </view>
      <navigator class="result-card__action" url="/pages/question-list/index"
        >继续浏览题库</navigator
      >
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

  &__action {
    padding: 16rpx 28rpx;
    border-radius: 999rpx;
    background: #1677ff;
    color: #fff;
  }
}
</style>
