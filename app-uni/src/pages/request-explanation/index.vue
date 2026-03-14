<script setup lang="ts">
import { ref } from 'vue';

import { createExplanationRequest } from '@/services/request';

interface PageOptions {
  questionId?: string;
  title?: string;
}

const note = ref('');
const submitting = ref(false);

function getPageOptions() {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1] as { options?: PageOptions } | undefined;
  return current?.options || {};
}

const pageOptions = getPageOptions();
const questionId = Number(pageOptions.questionId || 0);
const title = decodeURIComponent(pageOptions.title || '');

async function submit() {
  if (!questionId || submitting.value) {
    return;
  }

  submitting.value = true;

  try {
    const result = await createExplanationRequest({
      questionId,
      note: note.value || undefined,
      source: 'MINIAPP',
    });

    uni.redirectTo({
      url: `/pages/submit-success/index?mode=${result.mode}&supportCount=${result.supportCount}`,
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <view class="page">
    <view class="card">
      <view class="card__label">题目</view>
      <view class="card__title">{{ title }}</view>
    </view>

    <view class="card">
      <view class="card__label">你想补充的讲解方向</view>
      <textarea
        v-model="note"
        class="card__textarea"
        maxlength="300"
        placeholder="比如：希望加真实面试追问、代码示例、性能场景分析..."
      />
    </view>

    <button class="submit-btn submit-btn--primary" :loading="submitting" @click="submit">
      提交讲解申请
    </button>
  </view>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;

  &__label {
    color: #86909c;
    font-size: 24rpx;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 600;
  }

  &__textarea {
    width: 100%;
    min-height: 220rpx;
  }
}

.submit-btn {
  margin-top: 8rpx;

  &--primary {
    background: #1677ff;
    color: #fff;
  }
}
</style>
