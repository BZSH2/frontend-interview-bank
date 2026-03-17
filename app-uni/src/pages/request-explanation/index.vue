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
      <view class="card">
        <view class="card__label">题目</view>
        <view class="card__title">{{ title || `题目 #${questionId}` }}</view>
      </view>

      <view class="card">
        <view class="card__label">你想补充的讲解方向</view>
        <textarea
          v-model="note"
          class="card__textarea"
          maxlength="300"
          placeholder="比如：希望加真实面试追问、代码示例、性能场景分析..."
        />
        <view class="card__hint">备注为选填；仅输入空格时会自动按“未填写”处理。</view>
        <view class="card__count">{{ noteLength }}/300</view>
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

.card,
.error-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;
}

.card {
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

  &__hint {
    color: #86909c;
    font-size: 24rpx;
    line-height: 1.6;
  }

  &__count {
    align-self: flex-end;
    color: #86909c;
    font-size: 24rpx;
  }
}

.error-card {
  background: #fff1f0;

  &__text {
    color: #cf1322;
    line-height: 1.6;
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
