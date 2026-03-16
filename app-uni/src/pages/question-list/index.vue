<script setup lang="ts">
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import QuestionCard from '@/components/question-card.vue';
import { getCategories, getQuestions } from '@/services/question';
import type { CategoryItem, Difficulty, QuestionItem } from '@/types/question';
import { getDifficultyLabel, normalizeKeyword } from '@/utils/question';

interface PageOptions {
  keyword?: string;
  categoryId?: string;
  categoryName?: string;
  difficulty?: Difficulty;
}

const PAGE_SIZE = 10;

const difficultyOptions: Array<{ label: string; value: Difficulty | '' }> = [
  { label: '全部难度', value: '' },
  { label: '简单', value: 'EASY' },
  { label: '中等', value: 'MEDIUM' },
  { label: '困难', value: 'HARD' },
];

const loading = ref(false);
const loadingMore = ref(false);
const error = ref('');
const loadMoreError = ref('');
const keywordInput = ref('');
const keyword = ref('');
const questions = ref<QuestionItem[]>([]);
const categories = ref<CategoryItem[]>([]);
const total = ref(0);
const page = ref(1);
const hasMore = ref(false);
const categoryId = ref<number | undefined>();
const categoryName = ref('');
const difficulty = ref<Difficulty | ''>('');

const hasActiveFilters = computed(() =>
  Boolean(keyword.value || categoryId.value || difficulty.value),
);
const currentDifficultyLabel = computed(() =>
  difficulty.value ? getDifficultyLabel(difficulty.value) : '全部难度',
);
const filterSummary = computed(() => {
  const summary = [categoryName.value || '全部分类', currentDifficultyLabel.value];

  if (keyword.value) {
    summary.push(`关键词：${keyword.value}`);
  }

  return summary.join(' · ');
});
const resultSummary = computed(() =>
  total.value ? `已加载 ${questions.value.length}/${total.value} 题` : '共 0 题',
);

async function loadCategories() {
  try {
    categories.value = await getCategories();

    if (categoryId.value && !categoryName.value) {
      categoryName.value =
        categories.value.find((item) => item.id === categoryId.value)?.name || '';
    }
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '分类加载失败',
      icon: 'none',
    });
  }
}

async function loadQuestions(options: { append?: boolean } = {}) {
  const append = options.append || false;

  if (append) {
    if (loading.value || loadingMore.value || !hasMore.value) {
      return;
    }
    loadingMore.value = true;
    loadMoreError.value = '';
  } else {
    loading.value = true;
    error.value = '';
    loadMoreError.value = '';
  }

  const nextPage = append ? page.value + 1 : 1;

  try {
    const result = await getQuestions({
      page: nextPage,
      pageSize: PAGE_SIZE,
      keyword: keyword.value || undefined,
      categoryId: categoryId.value,
      difficulty: difficulty.value || undefined,
    });

    questions.value = append ? [...questions.value, ...result.list] : result.list;
    total.value = result.total;
    page.value = result.page;
    hasMore.value = result.hasMore;
  } catch (err) {
    const message = err instanceof Error ? err.message : append ? '加载更多失败' : '题库加载失败';

    if (append) {
      loadMoreError.value = message;
      uni.showToast({
        title: message,
        icon: 'none',
      });
      return;
    }

    error.value = message;
    questions.value = [];
    total.value = 0;
    page.value = 1;
    hasMore.value = false;
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

async function bootstrap() {
  await Promise.allSettled([loadCategories(), loadQuestions()]);
}

function scrollToTop() {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 150,
  });
}

function applyFilters() {
  keyword.value = normalizeKeyword(keywordInput.value);
  keywordInput.value = keyword.value;
  scrollToTop();
  void loadQuestions();
}

function handleSearch() {
  applyFilters();
}

function selectCategory(item?: CategoryItem) {
  categoryId.value = item?.id;
  categoryName.value = item?.name || '';
  applyFilters();
}

function selectDifficulty(value: Difficulty | '') {
  difficulty.value = value;
  applyFilters();
}

function resetFilters() {
  keywordInput.value = '';
  keyword.value = '';
  categoryId.value = undefined;
  categoryName.value = '';
  difficulty.value = '';
  scrollToTop();
  void loadQuestions();
}

function loadMoreQuestions() {
  void loadQuestions({ append: true });
}

onLoad((options) => {
  const pageOptions = (options || {}) as PageOptions;
  keyword.value = normalizeKeyword(pageOptions.keyword || '');
  keywordInput.value = keyword.value;
  categoryId.value = pageOptions.categoryId ? Number(pageOptions.categoryId) : undefined;
  categoryName.value = pageOptions.categoryName ? decodeURIComponent(pageOptions.categoryName) : '';
  difficulty.value = pageOptions.difficulty || '';
  void bootstrap();
});

onReachBottom(() => {
  loadMoreQuestions();
});

onPullDownRefresh(async () => {
  await Promise.allSettled([loadCategories(), loadQuestions()]);
  uni.stopPullDownRefresh();
});
</script>

<template>
  <view class="page">
    <view class="toolbar">
      <input
        v-model="keywordInput"
        class="toolbar__input"
        confirm-type="search"
        placeholder="搜索题目标题 / 摘要 / 标签 / 关键词"
        @confirm="handleSearch"
      />
      <button class="toolbar__button toolbar__button--primary" size="mini" @click="handleSearch">
        搜索
      </button>
      <button
        v-if="hasActiveFilters"
        class="toolbar__button toolbar__button--ghost"
        size="mini"
        @click="resetFilters"
      >
        重置
      </button>
    </view>

    <scroll-view class="filter-scroll" scroll-x>
      <view class="filter-row">
        <view
          v-for="item in difficultyOptions"
          :key="item.value || 'ALL'"
          class="filter-chip"
          :class="{ 'filter-chip--active': difficulty === item.value }"
          @click="selectDifficulty(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </scroll-view>

    <scroll-view class="category-scroll" scroll-x>
      <view class="category-row">
        <view
          class="category-chip"
          :class="{ 'category-chip--active': !categoryId }"
          @click="selectCategory()"
        >
          全部分类
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
      <view class="summary-bar__main">{{ filterSummary }}</view>
      <view class="summary-bar__sub">{{ resultSummary }}</view>
    </view>

    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="error" class="error-card">
      <view class="error-card__text">{{ error }}</view>
      <view class="error-card__actions">
        <button class="error-card__button" size="mini" @click="() => loadQuestions()">重试</button>
        <button class="error-card__button" size="mini" @click="resetFilters">清空筛选</button>
      </view>
    </view>
    <view v-else-if="questions.length === 0" class="empty-card">
      <view class="empty-card__title">没有找到匹配题目</view>
      <view class="empty-card__desc">可以换个关键词，或者试试清空分类与难度筛选。</view>
      <button v-if="hasActiveFilters" class="empty-card__button" size="mini" @click="resetFilters">
        清空筛选
      </button>
    </view>
    <view v-else class="question-list">
      <QuestionCard v-for="item in questions" :key="item.id" :item="item" />

      <view class="load-more-card">
        <button
          v-if="loadMoreError"
          class="load-more-card__button load-more-card__button--danger"
          size="mini"
          @click="loadMoreQuestions"
        >
          加载更多失败，点击重试
        </button>
        <view v-else-if="loadingMore" class="load-more-card__text">加载更多中...</view>
        <button
          v-else-if="hasMore"
          class="load-more-card__button"
          size="mini"
          @click="loadMoreQuestions"
        >
          加载更多
        </button>
        <view v-else class="load-more-card__text">已经到底了</view>
      </view>
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
    flex-shrink: 0;

    &--primary {
      background: #1677ff;
      color: #fff;
    }

    &--ghost {
      background: #fff;
      color: #1677ff;
      border: 1px solid #b7d4ff;
    }
  }
}

.filter-scroll,
.category-scroll {
  white-space: nowrap;
}

.filter-row,
.category-row {
  display: inline-flex;
  gap: 12rpx;
}

.filter-chip,
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
  flex-direction: column;
  gap: 8rpx;
  color: #86909c;
  font-size: 24rpx;

  &__main {
    color: #4e5969;
    line-height: 1.6;
  }
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

.error-card,
.empty-card,
.load-more-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #fff;
}

.error-card {
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

.empty-card {
  align-items: center;
  text-align: center;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
  }

  &__desc {
    color: #86909c;
    line-height: 1.6;
  }

  &__button {
    padding: 0 24rpx;
    border-radius: 999rpx;
    background: #1677ff;
    color: #fff;
  }
}

.load-more-card {
  align-items: center;

  &__text {
    color: #86909c;
  }

  &__button {
    padding: 0 28rpx;
    border-radius: 999rpx;
    background: #fff;
    color: #1677ff;
    border: 1px solid #b7d4ff;

    &--danger {
      color: #cf1322;
      border-color: #ffccc7;
    }
  }
}
</style>
