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
  if (!questionId.value || submitting.value) {
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
      note: note.value || undefined,
      source: 'MINIAPP',
    });

    uni.redirectTo({
      url: `/pages/submit-success/index?mode=${result.mode}&supportCount=${result.supportCount}&questionId=${questionId.value}&title=${encodeURIComponent(title.value)}`,
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
        <view class="card__count">{{ noteLength }}/300</view>
      </view>

      <button class="submit-btn submit-btn--primary" :loading="submitting" @click="submit">
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
