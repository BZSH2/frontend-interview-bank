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
      <button class="error-card__button" @click="loadDetail">重新加载</button>
    </view>

    <template v-else-if="question">
      <view class="hero-card">
        <view class="hero-card__badges">
          <text class="hero-card__badge hero-card__badge--category">{{
            question.category.name
          }}</text>
          <text class="hero-card__badge hero-card__badge--difficulty">{{ difficultyLabel }}</text>
          <text
            class="hero-card__badge"
            :class="
              question.hasExplanation ? 'hero-card__badge--ready' : 'hero-card__badge--pending'
            "
          >
            {{ question.hasExplanation ? '已有讲解' : '暂无讲解' }}
          </text>
        </view>
        <view class="hero-card__title">{{ question.title }}</view>
        <view v-if="question.tags?.length" class="hero-card__tags">
          <text v-for="tag in question.tags" :key="tag" class="hero-card__tag">{{ tag }}</text>
        </view>
        <view class="hero-card__content">{{ question.content }}</view>
      </view>

      <view class="section-card">
        <view class="section-card__header">
          <view class="section-card__title">参考答案</view>
          <view class="section-card__label">Answer</view>
        </view>
        <view class="section-card__content">{{ question.answer || '暂未补充' }}</view>
      </view>

      <view v-if="question.explanationContent" class="section-card section-card--highlight">
        <view class="section-card__header">
          <view>
            <view class="section-card__title">系统讲解</view>
            <view class="section-card__sub">结构化讲解，适合做面试复盘和追问准备</view>
          </view>
          <view v-if="explanationTimeText" class="section-card__time">{{
            explanationTimeText
          }}</view>
        </view>
        <view v-if="explanationSourceLabel || explanationFilePathText" class="section-card__meta">
          <text v-if="explanationSourceLabel" class="section-card__source-tag">{{
            explanationSourceLabel
          }}</text>
          <text v-if="explanationFilePathText" class="section-card__path">{{
            explanationFilePathText
          }}</text>
        </view>
        <!-- #ifdef H5 -->
        <VditorPreviewH5 class="section-card__markdown" :source="question.explanationContent" />
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <MarkdownViewer class="section-card__markdown" :source="question.explanationContent" />
        <!-- #endif -->
      </view>

      <view
        v-if="question.hasExplanation || requestStatus || requestStatusError"
        class="section-card"
      >
        <view class="section-card__header">
          <view class="section-card__title">讲解申请状态</view>
          <view class="section-card__label">Request</view>
        </view>

        <view v-if="question.hasExplanation" class="section-card__content">
          该题已具备系统讲解内容，当前不需要重复申请。
        </view>
        <template v-else-if="requestStatus">
          <view class="section-card__content">{{ requestSummary }}</view>
          <button class="action-btn action-btn--primary" @click="navigateToRequest">
            {{ requestStatus.hasRequest ? '我也想看这题讲解' : '申请新增讲解' }}
          </button>
        </template>
        <template v-else>
          <view class="section-card__content section-card__content--error">{{
            requestStatusError
          }}</view>
          <view class="section-card__actions">
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

.hero-card,
.section-card,
.state-card,
.error-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 30rpx;
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 28rpx;
  background: $card-background;
  box-shadow: $card-shadow;
}

.hero-card {
  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    font-weight: 600;

    &--category {
      background: $soft-purple-background;
      color: $brand-color;
    }

    &--difficulty {
      background: $soft-blue-background;
      color: $brand-secondary-color;
    }

    &--ready {
      background: $soft-green-background;
      color: $success-color;
    }

    &--pending {
      background: $warning-background;
      color: $warning-color;
    }
  }

  &__title {
    color: $text-color;
    font-size: 38rpx;
    font-weight: 700;
    line-height: 1.34;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  &__tag {
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    background: #f6f5f2;
    color: $brand-secondary-color;
    font-size: 22rpx;
  }

  &__content {
    color: $sub-text-color;
    line-height: 1.82;
    white-space: pre-wrap;
  }
}

.section-card {
  &--highlight {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.96) 0%,
      rgba(249, 248, 245, 0.96) 100%
    );
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16rpx;
  }

  &__title {
    color: $text-color;
    font-size: 30rpx;
    font-weight: 700;
  }

  &__label {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: #f8f7f4;
    color: $brand-secondary-color;
    font-size: 22rpx;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__sub {
    margin-top: 6rpx;
    color: $sub-text-color;
    font-size: 24rpx;
    line-height: 1.6;
  }

  &__time {
    flex-shrink: 0;
    color: $muted-text-color;
    font-size: 22rpx;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    align-items: center;
  }

  &__source-tag {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: #f8f7f4;
    color: $brand-secondary-color;
    font-size: 22rpx;
    font-weight: 600;
  }

  &__path {
    color: $muted-text-color;
    font-size: 22rpx;
  }

  &__content {
    color: $sub-text-color;
    line-height: 1.8;
    white-space: pre-wrap;

    &--error {
      color: $danger-color;
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
  color: $muted-text-color;
}

.error-card {
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

.action-btn {
  padding: 0 30rpx;
  border-radius: 999rpx;
  background: #fff;
  color: $brand-color;
  border: 1px solid rgba(22, 28, 45, 0.08);
  font-size: 24rpx;

  &--primary {
    background: $brand-gradient;
    color: #fff;
    border: none;
  }
}
</style>
