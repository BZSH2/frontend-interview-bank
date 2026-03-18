<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import { getQuestionDetail } from '@/services/question';
import { createExplanationRequest } from '@/services/request';

interface PageOptions {
  questionId?: string;
  title?: string;
}

const note = ref('');
const submitting = ref(false);
const questionId = ref(0);
const title = ref('');
const pageError = ref('');

const noteLength = computed(() => note.value.length);
const trimmedNote = computed(() => note.value.trim());
const canSubmit = computed(
  () => Boolean(questionId.value) && !submitting.value && !pageError.value,
);

function resolveRequestSource() {
  return typeof window !== 'undefined' ? 'H5' : 'MINIAPP';
}

async function loadQuestionTitle() {
  if (!questionId.value || title.value) {
    return;
  }

  try {
    const detail = await getQuestionDetail(questionId.value);
    title.value = detail.title;
  } catch (err) {
    pageError.value = err instanceof Error ? err.message : '题目信息加载失败';
  }
}

async function submit() {
  if (!canSubmit.value) {
    uni.showToast({
      title: '题目信息异常',
      icon: 'none',
    });
    return;
  }

  submitting.value = true;

  try {
    const result = await createExplanationRequest({
      questionId: questionId.value,
      note: trimmedNote.value || undefined,
      source: resolveRequestSource(),
    });

    const query = [
      `mode=${result.mode}`,
      `supportCount=${result.supportCount}`,
      `questionId=${questionId.value}`,
      `title=${encodeURIComponent(title.value)}`,
      `syncStatus=${result.syncStatus}`,
      `message=${encodeURIComponent(result.message)}`,
      `githubIssueNumber=${result.githubIssueNumber || ''}`,
    ].join('&');

    uni.redirectTo({
      url: `/pages/submit-success/index?${query}`,
    });
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '提交失败，请稍后重试',
      icon: 'none',
      duration: 2500,
    });
  } finally {
    submitting.value = false;
  }
}

onLoad((options) => {
  const pageOptions = (options || {}) as PageOptions;
  questionId.value = Number(pageOptions.questionId || 0);
  title.value = pageOptions.title ? decodeURIComponent(pageOptions.title) : '';

  if (!questionId.value) {
    pageError.value = '缺少题目 ID，无法提交讲解申请';
    return;
  }

  void loadQuestionTitle();
});
</script>

<template>
  <view class="page">
    <view v-if="pageError" class="error-card">
      <view class="error-card__text">{{ pageError }}</view>
    </view>

    <template v-else>
      <view class="hero-card">
        <view class="hero-card__eyebrow">Explain Request</view>
        <view class="hero-card__title">申请系统补充这道题的讲解</view>
        <view class="hero-card__desc"
          >你可以补充想看的方向，比如真实追问、代码示例、性能分析或易错点总结。</view
        >
      </view>

      <view class="card">
        <view class="card__label">题目</view>
        <view class="card__title">{{ title || `题目 #${questionId}` }}</view>
      </view>

      <view class="card">
        <view class="card__label">补充方向</view>
        <textarea
          v-model="note"
          class="card__textarea"
          maxlength="300"
          placeholder="比如：希望加真实面试追问、代码示例、性能场景分析..."
        />
        <view class="card__footer">
          <view class="card__hint">备注为选填；仅输入空格时会自动按“未填写”处理。</view>
          <view class="card__count">{{ noteLength }}/300</view>
        </view>
      </view>

      <button
        class="submit-btn submit-btn--primary"
        :disabled="!canSubmit"
        :loading="submitting"
        @click="submit"
      >
        提交讲解申请
      </button>
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
.card,
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
  &__eyebrow {
    color: $brand-secondary-color;
    font-size: 22rpx;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__title {
    color: $text-color;
    font-size: 36rpx;
    font-weight: 700;
    line-height: 1.35;
  }

  &__desc {
    color: $sub-text-color;
    line-height: 1.72;
    font-size: 25rpx;
  }
}

.card {
  &__label {
    color: $muted-text-color;
    font-size: 24rpx;
    font-weight: 600;
  }

  &__title {
    color: $text-color;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 1.4;
  }

  &__textarea {
    width: 100%;
    min-height: 240rpx;
    padding: 22rpx 24rpx;
    border-radius: 22rpx;
    background: #f8f7f4;
    line-height: 1.7;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    gap: 16rpx;
    align-items: flex-end;
  }

  &__hint {
    flex: 1;
    color: $sub-text-color;
    font-size: 24rpx;
    line-height: 1.62;
  }

  &__count {
    flex-shrink: 0;
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    background: #f6f5f2;
    color: $brand-secondary-color;
    font-size: 22rpx;
    font-weight: 600;
  }
}

.error-card {
  background: $danger-background;

  &__text {
    color: $danger-color;
    line-height: 1.68;
  }
}

.submit-btn {
  margin-top: 8rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;

  &--primary {
    background: $brand-gradient;
    color: #fff;
  }
}
</style>
