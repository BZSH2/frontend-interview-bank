<script setup lang="ts">
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { ref } from 'vue';

import QuestionCard from '@/components/question-card.vue';
import { getCategories, getQuestions } from '@/services/question';
import type { CategoryItem, QuestionItem } from '@/types/question';

interface PageOptions {
  keyword?: string;
  categoryId?: string;
  categoryName?: string;
}

const loading = ref(false);
const error = ref('');
const keyword = ref('');
const questions = ref<QuestionItem[]>([]);
const categories = ref<CategoryItem[]>([]);
const total = ref(0);
const categoryId = ref<number | undefined>();
const categoryName = ref('');

async function loadCategories() {
  categories.value = await getCategories();
}

async function loadQuestions() {
  loading.value = true;
  error.value = '';

  try {
    const result = await getQuestions({
      page: 1,
      pageSize: 20,
      keyword: keyword.value || undefined,
      categoryId: categoryId.value,
    });
    questions.value = result.list;
    total.value = result.total;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '题库加载失败';
  } finally {
    loading.value = false;
  }
}

async function bootstrap() {
  await Promise.all([loadCategories(), loadQuestions()]);
}

function handleSearch() {
  void loadQuestions();
}

function selectCategory(item?: CategoryItem) {
  categoryId.value = item?.id;
  categoryName.value = item?.name || '';
  void loadQuestions();
}

function resetFilters() {
  keyword.value = '';
  categoryId.value = undefined;
  categoryName.value = '';
  void loadQuestions();
}

onLoad((options) => {
  const pageOptions = (options || {}) as PageOptions;
  keyword.value = pageOptions.keyword || '';
  categoryId.value = pageOptions.categoryId ? Number(pageOptions.categoryId) : undefined;
  categoryName.value = pageOptions.categoryName ? decodeURIComponent(pageOptions.categoryName) : '';
  void bootstrap();
});

onPullDownRefresh(async () => {
  await loadQuestions();
  uni.stopPullDownRefresh();
});
</script>

<template>
  <view class="page">
    <view class="toolbar">
      <input v-model="keyword" class="toolbar__input" placeholder="搜索题目 / 标签 / 关键词" />
      <button class="toolbar__button toolbar__button--primary" size="mini" @click="handleSearch">
        搜索
      </button>
    </view>

    <scroll-view class="category-scroll" scroll-x>
      <view class="category-row">
        <view
          class="category-chip"
          :class="{ 'category-chip--active': !categoryId }"
          @click="selectCategory()"
        >
          全部
        </view>
        <view
          v-for="item in categories"
          :key="item.id"
          class="category-chip"
          :class="{ 'category-chip--active': categoryId === item.id }"
          @click="selectCategory(item)"
        >
          {{ item.name }}
        </view>
      </view>
    </scroll-view>

    <view class="summary-bar">
      <text>{{ categoryName ? `当前分类：${categoryName}` : '全部题目' }}</text>
      <text>共 {{ total }} 题</text>
    </view>

    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="error" class="error-card">
      <view class="error-card__text">{{ error }}</view>
      <view class="error-card__actions">
        <button class="error-card__button" size="mini" @click="loadQuestions">重试</button>
        <button class="error-card__button" size="mini" @click="resetFilters">清空筛选</button>
      </view>
    </view>
    <view v-else-if="questions.length === 0" class="state">暂无数据</view>
    <view v-else class="question-list">
      <QuestionCard v-for="item in questions" :key="item.id" :item="item" />
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

.toolbar {
  display: flex;
  gap: 16rpx;

  &__input {
    flex: 1;
    padding: 20rpx 24rpx;
    border-radius: 16rpx;
    background: #fff;
  }

  &__button {
    &--primary {
      background: #1677ff;
      color: #fff;
    }
  }
}

.category-scroll {
  white-space: nowrap;
}

.category-row {
  display: inline-flex;
  gap: 12rpx;
}

.category-chip {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #4e5969;
  font-size: 24rpx;

  &--active {
    background: #1677ff;
    color: #fff;
  }
}

.summary-bar {
  display: flex;
  justify-content: space-between;
  color: #86909c;
  font-size: 24rpx;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.state {
  padding: 48rpx 0;
  text-align: center;
  color: #86909c;
}

.error-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff1f0;

  &__text {
    color: #cf1322;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: 16rpx;
  }

  &__button {
    padding: 0 24rpx;
    border: 1px solid #ffccc7;
    border-radius: 999rpx;
    background: #fff;
    color: #cf1322;
  }
}
</style>
