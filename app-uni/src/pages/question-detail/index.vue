<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getQuestionDetail, getQuestionRequestStatus } from '@/services/question';
import type { QuestionDetail, QuestionRequestStatus } from '@/types/question';

const question = ref<QuestionDetail | null>(null);
const requestStatus = ref<QuestionRequestStatus | null>(null);

async function loadDetail() {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1];
  const id = Number(current?.options?.id || 0);

  if (!id) return;

  const [detailResult, statusResult] = await Promise.all([
    getQuestionDetail(id),
    getQuestionRequestStatus(id),
  ]);

  question.value = detailResult;
  requestStatus.value = statusResult;
}

function navigateToRequest() {
  if (!question.value) return;
  uni.navigateTo({
    url: `/pages/request-explanation/index?questionId=${question.value.id}&title=${encodeURIComponent(question.value.title)}`,
  });
}

onMounted(loadDetail);
</script>

<template>
  <view v-if="question" class="page">
    <view class="card">
      <view class="card__title">{{ question.title }}</view>
      <view class="card__meta">
        <text>{{ question.category.name }}</text>
        <text>{{ question.difficulty }}</text>
        <text>{{ question.hasExplanation ? '已有讲解' : '暂无讲解' }}</text>
      </view>
      <view class="card__content">{{ question.content }}</view>
    </view>

    <view class="card">
      <view class="card__section-title">参考答案</view>
      <view class="card__content">{{ question.answer || '暂未补充' }}</view>
    </view>

    <view class="card" v-if="requestStatus">
      <view class="card__section-title">讲解申请状态</view>
      <view class="card__content">
        {{ requestStatus.hasRequest ? `已有 ${requestStatus.supportCount} 人申请` : '当前还没有申请记录' }}
      </view>
      <button class="action-btn" type="primary" @click="navigateToRequest">
        {{ requestStatus.hasRequest ? '我也想看这题讲解' : '申请新增讲解' }}
      </button>
    </view>
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

  &__title {
    font-size: 34rpx;
    font-weight: 700;
  }

  &__meta {
    display: flex;
    gap: 16rpx;
    color: #86909c;
    font-size: 24rpx;
  }

  &__section-title {
    font-size: 28rpx;
    font-weight: 600;
  }

  &__content {
    line-height: 1.8;
    white-space: pre-wrap;
  }
}

.action-btn {
  margin-top: 8rpx;
}
</style>
