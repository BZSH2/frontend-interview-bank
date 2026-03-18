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
    <view class="list-hero">
      <view class="list-hero__eyebrow">Question Library</view>
      <view class="list-hero__title">题库列表</view>
      <view class="list-hero__desc"
        >用关键词、难度和分类快速筛选，把注意力集中在真正需要练的题上。</view
      >
    </view>

    <view class="toolbar-card">
      <input
        v-model="keywordInput"
        class="toolbar-card__input"
        confirm-type="search"
        placeholder="搜索题目标题 / 摘要 / 标签 / 关键词"
        @confirm="handleSearch"
      />
      <view class="toolbar-card__actions">
        <button
          class="toolbar-card__button toolbar-card__button--primary"
          size="mini"
          @click="handleSearch"
        >
          搜索
        </button>
        <button
          v-if="hasActiveFilters"
          class="toolbar-card__button toolbar-card__button--ghost"
          size="mini"
          @click="resetFilters"
        >
          重置
        </button>
      </view>
    </view>

    <view class="filter-panel">
      <view class="filter-panel__label">难度</view>
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
    </view>

    <view class="category-nav-card">
      <view class="category-nav-card__head">
        <view class="filter-panel__label">分类导航</view>
        <view class="category-nav-card__current">{{ categoryName || '全部分类' }}</view>
      </view>
      <scroll-view class="category-scroll" scroll-x>
        <view class="category-row">
          <view
            class="category-tab"
            :class="{ 'category-tab--active': !categoryId }"
            @click="selectCategory()"
          >
            全部分类
          </view>
          <view
            v-for="item in categories"
            :key="item.id"
            class="category-tab"
            :class="{ 'category-tab--active': categoryId === item.id }"
            @click="selectCategory(item)"
          >
            {{ item.name }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="summary-bar">
      <view class="summary-bar__main">{{ filterSummary }}</view>
      <view class="summary-bar__sub">{{ resultSummary }}</view>
    </view>

    <view v-if="loading" class="state">正在加载题目...</view>
    <view v-else-if="error" class="error-card">
      <view class="error-card__text">{{ error }}</view>
      <view class="error-card__actions">
        <button class="error-card__button" size="mini" @click="() => loadQuestions()">重试</button>
        <button
          class="error-card__button error-card__button--ghost"
          size="mini"
          @click="resetFilters"
        >
          清空筛选
        </button>
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

.list-hero,
.toolbar-card,
.filter-panel,
.category-nav-card,
.summary-bar,
.error-card,
.empty-card,
.load-more-card {
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 28rpx;
  background: $card-background;
  box-shadow: $card-shadow;
}

.list-hero {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 30rpx;

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
  }

  &__desc {
    color: $sub-text-color;
    line-height: 1.72;
    font-size: 25rpx;
  }
}

.toolbar-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 24rpx;

  &__input {
    width: 100%;
    padding: 22rpx 24rpx;
    border-radius: 20rpx;
    background: #f8f7f4;
    font-size: 26rpx;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  &__button {
    padding: 0 28rpx;
    border-radius: 999rpx;
    font-size: 24rpx;

    &--primary {
      background: $brand-gradient;
      color: #fff;
    }

    &--ghost {
      background: #fff;
      color: $brand-color;
      border: 1px solid rgba(22, 28, 45, 0.08);
    }
  }
}

.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 24rpx;

  &__label {
    color: $text-color;
    font-size: 24rpx;
    font-weight: 600;
  }
}

.filter-scroll,
.category-scroll {
  white-space: nowrap;
}

.filter-row {
  display: inline-flex;
  gap: 12rpx;
}

.filter-chip {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: #f8f7f4;
  color: $sub-text-color;
  font-size: 24rpx;
  font-weight: 500;

  &--active {
    background: $brand-gradient;
    color: #fff;
  }
}

.category-nav-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 24rpx;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  &__current {
    color: $muted-text-color;
    font-size: 22rpx;
  }
}

.category-row {
  position: relative;
  display: inline-flex;
  gap: 28rpx;
  min-width: 100%;
  padding-bottom: 6rpx;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: rgba(22, 28, 45, 0.08);
  }
}

.category-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 8rpx 0 18rpx;
  color: $muted-text-color;
  font-size: 26rpx;
  font-weight: 500;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 4rpx;
    border-radius: 999rpx;
    background: transparent;
  }

  &--active {
    color: $brand-color;
    font-weight: 700;

    &::after {
      background: $brand-color;
    }
  }
}

.summary-bar {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 22rpx 24rpx;

  &__main {
    color: $text-color;
    line-height: 1.68;
    font-size: 25rpx;
    font-weight: 600;
  }

  &__sub {
    color: $muted-text-color;
    font-size: 23rpx;
  }
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.state {
  padding: 54rpx 0;
  text-align: center;
  color: $muted-text-color;
}

.error-card,
.empty-card,
.load-more-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 30rpx;
}

.error-card {
  background: $danger-background;

  &__text {
    color: $danger-color;
    line-height: 1.68;
  }

  &__actions {
    display: flex;
    gap: 12rpx;
    flex-wrap: wrap;
  }

  &__button {
    padding: 0 28rpx;
    border-radius: 999rpx;
    background: #fff;
    color: $danger-color;
    font-size: 24rpx;

    &--ghost {
      color: $brand-color;
    }
  }
}

.empty-card {
  align-items: center;
  text-align: center;

  &__title {
    color: $text-color;
    font-size: 32rpx;
    font-weight: 700;
  }

  &__desc {
    color: $sub-text-color;
    line-height: 1.68;
  }

  &__button {
    padding: 0 30rpx;
    border-radius: 999rpx;
    background: $brand-gradient;
    color: #fff;
    font-size: 24rpx;
  }
}

.load-more-card {
  align-items: center;

  &__text {
    color: $muted-text-color;
  }

  &__button {
    padding: 0 30rpx;
    border-radius: 999rpx;
    background: #fff;
    color: $brand-color;
    border: 1px solid rgba(22, 28, 45, 0.08);
    font-size: 24rpx;

    &--danger {
      color: $danger-color;
      border-color: rgba(194, 65, 93, 0.16);
    }
  }
}
</style>
