<script setup lang="ts">
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { ref } from 'vue';

import { getQuestionDetail, getQuestionRequestStatus } from '@/services/question';
import type { QuestionDetail, QuestionRequestStatus } from '@/types/question';

interface PageOptions {
  id?: string;
}

const question = ref<QuestionDetail | null>(null);
const requestStatus = ref<QuestionRequestStatus | null>(null);
const loading = ref(false);
const error = ref('');
const questionId = ref(0);

async function loadDetail() {
  if (!questionId.value) {
    error.value = '缺少题目 ID';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const [detailResult, statusResult] = await Promise.all([
      getQuestionDetail(questionId.value),
      getQuestionRequestStatus(questionId.value),
    ]);

    question.value = detailResult;
    requestStatus.value = statusResult;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '题目详情加载失败';
  } finally {
    loading.value = false;
  }
}

function navigateToRequest() {
  if (!question.value) {
    return;
  }

  uni.navigateTo({
    url: `/pages/request-explanation/index?questionId=${question.value.id}&title=${encodeURIComponent(question.value.title)}`,
  });
}

onLoad((options) => {
  const pageOptions = (options || {}) as PageOptions;
  questionId.value = Number(pageOptions.id || 0);
  void loadDetail();
});

onPullDownRefresh(async () => {
  await loadDetail();
  uni.stopPullDownRefresh();
});
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state-card">题目详情加载中...</view>

    <view v-else-if="error" class="error-card">
      <view class="error-card__text">{{ error }}</view>
      <button class="error-card__button" @click="loadDetail">重试</button>
    </view>

    <template v-else-if="question">
      <view class="card">
        <view class="card__title">{{ question.title }}</view>
        <view class="card__meta">
          <text>{{ question.category.name }}</text>
          <text>{{ question.difficulty }}</text>
          <text>{{ question.hasExplanation ? '已有讲解' : '暂无讲解' }}</text>
        </view>
        <view v-if="question.tags?.length" class="card__tags">
          <text v-for="tag in question.tags" :key="tag" class="card__tag">{{ tag }}</text>
        </view>
        <view class="card__content">{{ question.content }}</view>
      </view>

      <view class="card">
        <view class="card__section-title">参考答案</view>
        <view class="card__content">{{ question.answer || '暂未补充' }}</view>
      </view>

      <view v-if="requestStatus" class="card">
        <view class="card__section-title">讲解申请状态</view>

        <view v-if="question.hasExplanation" class="card__content">
          该题已具备系统讲解内容，当前不需要重复申请。
        </view>
        <view v-else class="card__content">
          {{
            requestStatus.hasRequest
              ? `已有 ${requestStatus.supportCount} 人申请`
              : '当前还没有申请记录'
          }}
        </view>

        <button
          v-if="!question.hasExplanation"
          class="action-btn action-btn--primary"
          @click="navigateToRequest"
        >
          {{ requestStatus.hasRequest ? '我也想看这题讲解' : '申请新增讲解' }}
        </button>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx;
}

.card,
.state-card,
.error-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;
}

.card {
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

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  &__tag {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: #f2f3f5;
    color: #4e5969;
    font-size: 22rpx;
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

.state-card {
  color: #86909c;
}

.error-card {
  background: #fff1f0;

  &__text {
    color: #cf1322;
    line-height: 1.6;
  }

  &__button {
    align-self: flex-start;
    padding: 0 24rpx;
    border: 1px solid #ffccc7;
    border-radius: 999rpx;
    background: #fff;
    color: #cf1322;
  }
}

.action-btn {
  margin-top: 8rpx;

  &--primary {
    background: #1677ff;
    color: #fff;
  }
}
</style>
