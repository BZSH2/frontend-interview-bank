<script setup lang="ts">
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import MarkdownViewer from '@/components/markdown-viewer.vue';
import VditorPreviewH5 from '@/components/vditor-preview-h5.vue';
import { getQuestionDetail, getQuestionRequestStatus } from '@/services/question';
import type { QuestionDetail, QuestionRequestStatus } from '@/types/question';
import { getDifficultyLabel } from '@/utils/question';

interface PageOptions {
  id?: string;
}

const question = ref<QuestionDetail | null>(null);
const requestStatus = ref<QuestionRequestStatus | null>(null);
const loading = ref(false);
const error = ref('');
const requestStatusError = ref('');
const questionId = ref(0);

const difficultyLabel = computed(() =>
  question.value ? getDifficultyLabel(question.value.difficulty) : '',
);
const requestSummary = computed(() => {
  if (!requestStatus.value) {
    return '';
  }

  if (!requestStatus.value.hasRequest) {
    return '当前还没有申请记录';
  }

  if (requestStatus.value.githubIssueNumber) {
    return `已有 ${requestStatus.value.supportCount} 人申请，已同步到 GitHub Issue #${requestStatus.value.githubIssueNumber}`;
  }

  return `已有 ${requestStatus.value.supportCount} 人申请，当前先记录在本地，待后续同步 GitHub`;
});

const explanationTimeText = computed(() => {
  if (!question.value?.explanationUpdatedAt) {
    return '';
  }

  const date = new Date(question.value.explanationUpdatedAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `最近更新：${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
});

const explanationSourceLabel = computed(() => {
  switch (question.value?.explanationSource) {
    case 'file':
      return 'MD 文件';
    case 'database':
      return '数据库';
    default:
      return '';
  }
});

const explanationFilePathText = computed(() => {
  if (!question.value?.explanationFilePath) {
    return '';
  }

  return `来源：${question.value.explanationFilePath}`;
});

async function loadRequestStatus() {
  if (!questionId.value) {
    return;
  }

  requestStatusError.value = '';

  try {
    requestStatus.value = await getQuestionRequestStatus(questionId.value);
  } catch (err) {
    requestStatus.value = null;
    requestStatusError.value = err instanceof Error ? err.message : '申请状态加载失败';
  }
}

async function loadDetail() {
  if (!questionId.value) {
    error.value = '缺少题目 ID';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    question.value = await getQuestionDetail(questionId.value);
    await loadRequestStatus();
  } catch (err) {
    question.value = null;
    requestStatus.value = null;
    requestStatusError.value = '';
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
          <text>{{ difficultyLabel }}</text>
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

      <view v-if="question.explanationContent" class="card card--highlight">
        <view class="card__section-header">
          <view class="card__section-title">系统讲解</view>
          <view v-if="explanationTimeText" class="card__section-time">{{
            explanationTimeText
          }}</view>
        </view>
        <view v-if="explanationSourceLabel || explanationFilePathText" class="card__section-meta">
          <text v-if="explanationSourceLabel" class="card__source-tag">{{
            explanationSourceLabel
          }}</text>
          <text v-if="explanationFilePathText" class="card__section-path">{{
            explanationFilePathText
          }}</text>
        </view>
        <!-- #ifdef H5 -->
        <VditorPreviewH5 class="card__markdown" :source="question.explanationContent" />
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <MarkdownViewer class="card__markdown" :source="question.explanationContent" />
        <!-- #endif -->
      </view>

      <view v-if="question.hasExplanation || requestStatus || requestStatusError" class="card">
        <view class="card__section-title">讲解申请状态</view>

        <view v-if="question.hasExplanation" class="card__content">
          该题已具备系统讲解内容，当前不需要重复申请。
        </view>
        <template v-else-if="requestStatus">
          <view class="card__content">{{ requestSummary }}</view>
          <button class="action-btn action-btn--primary" @click="navigateToRequest">
            {{ requestStatus.hasRequest ? '我也想看这题讲解' : '申请新增讲解' }}
          </button>
        </template>
        <template v-else>
          <view class="card__content card__content--error">{{ requestStatusError }}</view>
          <view class="card__actions">
            <button class="action-btn" @click="loadRequestStatus">重试加载状态</button>
            <button class="action-btn action-btn--primary" @click="navigateToRequest">
              直接申请新增讲解
            </button>
          </view>
        </template>
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
  &--highlight {
    border: 1px solid #d6e4ff;
    background: #f8fbff;
  }

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

  &__section-header {
    display: flex;
    justify-content: space-between;
    gap: 16rpx;
    align-items: center;
  }

  &__section-title {
    font-size: 28rpx;
    font-weight: 600;
  }

  &__section-time {
    color: #86909c;
    font-size: 22rpx;
  }

  &__section-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    align-items: center;
  }

  &__section-path {
    color: #86909c;
    font-size: 22rpx;
  }

  &__source-tag {
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
    background: #e8f3ff;
    color: #1677ff;
    font-size: 22rpx;
    line-height: 1.5;
  }

  &__content {
    line-height: 1.8;
    white-space: pre-wrap;

    &--error {
      color: #cf1322;
    }
  }

  &__markdown {
    width: 100%;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
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
