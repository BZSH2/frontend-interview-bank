<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import {
  createAdminCategory,
  createAdminQuestion,
  getAdminCategories,
  getAdminExplanationRequests,
  getAdminOverview,
  getAdminQuestionDetail,
  getAdminQuestions,
  getCategories,
  syncAdminExplanationRequest,
  updateAdminCategory,
  updateAdminExplanationRequestStatus,
  updateAdminQuestion,
} from '@/api/admin';
import type {
  AdminCategoryItem,
  AdminExplanationRequestItem,
  AdminOverview,
  AdminQuestionDetail,
  AdminQuestionListItem,
  CategoryItem,
  Difficulty,
  ExplanationStatus,
  QuestionPayload,
  QuestionStatus,
  RequestStatus,
  SyncStatus,
} from '@/types/admin';

const overview = ref<AdminOverview | null>(null);
const categories = ref<CategoryItem[]>([]);
const adminCategories = ref<AdminCategoryItem[]>([]);
const questions = ref<AdminQuestionListItem[]>([]);
const requests = ref<AdminExplanationRequestItem[]>([]);
const currentQuestionDetail = ref<AdminQuestionDetail | null>(null);

const loadingOverview = ref(false);
const loadingQuestions = ref(false);
const loadingRequests = ref(false);
const loadingCategories = ref(false);
const loadingBootstrap = ref(false);
const savingQuestion = ref(false);
const savingCategory = ref(false);
const syncingRequestId = ref<number | null>(null);
const updatingRequestId = ref<number | null>(null);

const activeTab = ref<'questions' | 'requests' | 'categories'>('questions');
const notice = ref<{ type: 'success' | 'error'; text: string } | null>(null);
let noticeTimer: ReturnType<typeof setTimeout> | null = null;

const questionFilters = reactive({
  keyword: '',
  categoryId: '',
  difficulty: '',
  status: '',
  hasExplanation: '',
});

const requestFilters = reactive({
  keyword: '',
  status: '',
  syncStatus: '',
});

const questionPager = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const requestPager = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const editorMode = ref<'create' | 'edit'>('create');
const selectedQuestionId = ref<number | null>(null);
const questionForm = reactive({
  categoryId: '',
  title: '',
  summary: '',
  content: '',
  answer: '',
  difficulty: 'MEDIUM' as Difficulty,
  status: 'PUBLISHED' as QuestionStatus,
  tagsText: '',
  explanationContent: '',
  explanationStatus: 'PUBLISHED' as ExplanationStatus,
});

const categoryEditorMode = ref<'create' | 'edit'>('create');
const selectedCategoryId = ref<number | null>(null);
const categoryForm = reactive({
  name: '',
  sort: '0',
});

const difficultyOptions: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
const questionStatusOptions: QuestionStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const explanationStatusOptions: ExplanationStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const requestStatusOptions: RequestStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'CLOSED'];
const syncStatusOptions: SyncStatus[] = ['local_only', 'github_synced'];

const difficultyLabelMap: Record<Difficulty, string> = {
  EASY: '初级',
  MEDIUM: '中级',
  HARD: '高级',
};

const questionStatusLabelMap: Record<QuestionStatus, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
};

const explanationStatusLabelMap: Record<ExplanationStatus, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
};

const requestStatusLabelMap: Record<RequestStatus, string> = {
  PENDING: '待处理',
  IN_PROGRESS: '处理中',
  DONE: '已完成',
  CLOSED: '已关闭',
};

const syncStatusLabelMap: Record<SyncStatus, string> = {
  local_only: '仅本地',
  github_synced: '已同步 GitHub',
};

const questionEditorTitle = computed(() =>
  editorMode.value === 'create' ? '新建题目' : `编辑题目 #${selectedQuestionId.value}`,
);
const categoryEditorTitle = computed(() =>
  categoryEditorMode.value === 'create' ? '新建分类' : `编辑分类 #${selectedCategoryId.value}`,
);
const questionPageCount = computed(() =>
  Math.max(1, Math.ceil(questionPager.total / questionPager.pageSize)),
);
const requestPageCount = computed(() =>
  Math.max(1, Math.ceil(requestPager.total / requestPager.pageSize)),
);
const questionHasActiveFilters = computed(
  () =>
    Boolean(questionFilters.keyword) ||
    Boolean(questionFilters.categoryId) ||
    Boolean(questionFilters.difficulty) ||
    Boolean(questionFilters.status) ||
    Boolean(questionFilters.hasExplanation),
);
const requestHasActiveFilters = computed(
  () =>
    Boolean(requestFilters.keyword) ||
    Boolean(requestFilters.status) ||
    Boolean(requestFilters.syncStatus),
);
const questionFilterSummary = computed(() => {
  const parts: string[] = [];
  if (questionFilters.keyword) {
    parts.push(`关键词：${questionFilters.keyword}`);
  }
  if (questionFilters.categoryId) {
    const category = categories.value.find(
      (item) => String(item.id) === questionFilters.categoryId,
    );
    parts.push(`分类：${category?.name || questionFilters.categoryId}`);
  }
  if (questionFilters.difficulty) {
    parts.push(`难度：${getDifficultyLabel(questionFilters.difficulty as Difficulty)}`);
  }
  if (questionFilters.status) {
    parts.push(`状态：${getQuestionStatusLabel(questionFilters.status as QuestionStatus)}`);
  }
  if (questionFilters.hasExplanation) {
    parts.push(questionFilters.hasExplanation === 'true' ? '仅看已有讲解' : '仅看暂无讲解');
  }
  return parts.length > 0 ? parts.join(' · ') : '当前显示全部题目';
});
const requestFilterSummary = computed(() => {
  const parts: string[] = [];
  if (requestFilters.keyword) {
    parts.push(`关键词：${requestFilters.keyword}`);
  }
  if (requestFilters.status) {
    parts.push(`申请状态：${getRequestStatusLabel(requestFilters.status as RequestStatus)}`);
  }
  if (requestFilters.syncStatus) {
    parts.push(`同步状态：${getSyncStatusLabel(requestFilters.syncStatus as SyncStatus)}`);
  }
  return parts.length > 0 ? parts.join(' · ') : '当前显示全部申请';
});
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api';
const hasAdminToken = Boolean(import.meta.env.VITE_ADMIN_TOKEN);

const overviewCards = computed(() => [
  { label: '分类总数', value: overview.value?.categoryTotal ?? '-', tone: 'default' },
  { label: '题目总数', value: overview.value?.questionTotal ?? '-', tone: 'default' },
  { label: '已有讲解', value: overview.value?.withExplanationCount ?? '-', tone: 'default' },
  { label: '申请总数', value: overview.value?.requestTotal ?? '-', tone: 'default' },
  { label: '待处理申请', value: overview.value?.pendingRequestCount ?? '-', tone: 'warn' },
  { label: '待同步 GitHub', value: overview.value?.localOnlyRequestCount ?? '-', tone: 'warn' },
]);
const tabSummaries = computed(() => ({
  questions: `共 ${overview.value?.questionTotal ?? 0} 题`,
  requests: `${overview.value?.pendingRequestCount ?? 0} 条待处理`,
  categories: `共 ${overview.value?.categoryTotal ?? 0} 类`,
}));

function setNotice(type: 'success' | 'error', text: string) {
  if (noticeTimer) {
    clearTimeout(noticeTimer);
  }

  notice.value = { type, text };
  noticeTimer = setTimeout(
    () => {
      notice.value = null;
      noticeTimer = null;
    },
    type === 'error' ? 6000 : 4000,
  );
}

function getDifficultyLabel(value: Difficulty) {
  return difficultyLabelMap[value] || value;
}

function getQuestionStatusLabel(value: QuestionStatus) {
  return questionStatusLabelMap[value] || value;
}

function getExplanationStatusLabel(value: ExplanationStatus) {
  return explanationStatusLabelMap[value] || value;
}

function getRequestStatusLabel(value: RequestStatus) {
  return requestStatusLabelMap[value] || value;
}

function getSyncStatusLabel(value: SyncStatus) {
  return syncStatusLabelMap[value] || value;
}

function getQuestionStatusClass(value: QuestionStatus) {
  return {
    DRAFT: 'status-tag--muted',
    PUBLISHED: 'status-tag--success',
    ARCHIVED: 'status-tag--warn',
  }[value];
}

function getDifficultyClass(value: Difficulty) {
  return {
    EASY: 'status-tag--success',
    MEDIUM: 'status-tag--info',
    HARD: 'status-tag--danger',
  }[value];
}

function getRequestStatusClass(value: RequestStatus) {
  return {
    PENDING: 'status-tag--warn',
    IN_PROGRESS: 'status-tag--info',
    DONE: 'status-tag--success',
    CLOSED: 'status-tag--muted',
  }[value];
}

function getSyncStatusClass(value: SyncStatus) {
  return value === 'github_synced' ? 'status-tag--success' : 'status-tag--warn';
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function resetQuestionForm() {
  questionForm.categoryId = categories.value[0] ? String(categories.value[0].id) : '';
  questionForm.title = '';
  questionForm.summary = '';
  questionForm.content = '';
  questionForm.answer = '';
  questionForm.difficulty = 'MEDIUM';
  questionForm.status = 'PUBLISHED';
  questionForm.tagsText = '';
  questionForm.explanationContent = '';
  questionForm.explanationStatus = 'PUBLISHED';
}

function resetCategoryForm() {
  categoryForm.name = '';
  categoryForm.sort = '0';
}

function fillQuestionForm(detail: AdminQuestionDetail) {
  questionForm.categoryId = String(detail.categoryId);
  questionForm.title = detail.title;
  questionForm.summary = detail.summary || '';
  questionForm.content = detail.content;
  questionForm.answer = detail.answer || '';
  questionForm.difficulty = detail.difficulty;
  questionForm.status = detail.status;
  questionForm.tagsText = detail.tags?.join(', ') || '';
  questionForm.explanationContent = detail.explanationContent || '';
  questionForm.explanationStatus = detail.explanationStatus || 'PUBLISHED';
}

function fillCategoryForm(item: AdminCategoryItem) {
  categoryForm.name = item.name;
  categoryForm.sort = String(item.sort);
}

function buildQuestionPayload(): QuestionPayload {
  return {
    categoryId: Number(questionForm.categoryId),
    title: questionForm.title.trim(),
    summary: questionForm.summary.trim() || undefined,
    content: questionForm.content.trim(),
    answer: questionForm.answer.trim() || undefined,
    difficulty: questionForm.difficulty,
    status: questionForm.status,
    tags: questionForm.tagsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    explanationContent: questionForm.explanationContent.trim(),
    explanationStatus: questionForm.explanationStatus,
  };
}

function buildCategoryPayload() {
  return {
    name: categoryForm.name.trim(),
    sort: Number(categoryForm.sort || 0),
  };
}

async function loadOverview() {
  loadingOverview.value = true;
  try {
    overview.value = await getAdminOverview();
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '概览加载失败');
  } finally {
    loadingOverview.value = false;
  }
}

async function loadCategories() {
  try {
    categories.value = await getCategories();
    if (!questionForm.categoryId && categories.value[0]) {
      questionForm.categoryId = String(categories.value[0].id);
    }
  } catch (error) {
    categories.value = [];
    setNotice('error', error instanceof Error ? error.message : '分类选项加载失败');
  }
}

async function loadAdminCategories() {
  loadingCategories.value = true;
  try {
    adminCategories.value = await getAdminCategories();
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '分类列表加载失败');
  } finally {
    loadingCategories.value = false;
  }
}

async function loadQuestions() {
  loadingQuestions.value = true;
  try {
    const result = await getAdminQuestions({
      page: questionPager.page,
      pageSize: questionPager.pageSize,
      keyword: questionFilters.keyword,
      categoryId: questionFilters.categoryId,
      difficulty: questionFilters.difficulty,
      status: questionFilters.status,
      hasExplanation: questionFilters.hasExplanation,
    });
    questions.value = result.list;
    questionPager.total = result.total;
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '题目列表加载失败');
  } finally {
    loadingQuestions.value = false;
  }
}

async function loadRequests() {
  loadingRequests.value = true;
  try {
    const result = await getAdminExplanationRequests({
      page: requestPager.page,
      pageSize: requestPager.pageSize,
      keyword: requestFilters.keyword,
      status: requestFilters.status,
      syncStatus: requestFilters.syncStatus,
    });
    requests.value = result.list;
    requestPager.total = result.total;
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '申请列表加载失败');
  } finally {
    loadingRequests.value = false;
  }
}

async function bootstrap() {
  loadingBootstrap.value = true;
  try {
    await Promise.all([
      loadCategories(),
      loadAdminCategories(),
      loadOverview(),
      loadQuestions(),
      loadRequests(),
    ]);
  } finally {
    loadingBootstrap.value = false;
  }
}

function applyQuestionFilters() {
  questionPager.page = 1;
  void loadQuestions();
}

function resetQuestionFilters() {
  questionFilters.keyword = '';
  questionFilters.categoryId = '';
  questionFilters.difficulty = '';
  questionFilters.status = '';
  questionFilters.hasExplanation = '';
  applyQuestionFilters();
}

function changeQuestionPage(delta: number) {
  const nextPage = questionPager.page + delta;
  if (nextPage < 1 || nextPage > questionPageCount.value) {
    return;
  }
  questionPager.page = nextPage;
  void loadQuestions();
}

function applyRequestFilters() {
  requestPager.page = 1;
  void loadRequests();
}

function resetRequestFilters() {
  requestFilters.keyword = '';
  requestFilters.status = '';
  requestFilters.syncStatus = '';
  applyRequestFilters();
}

function changeRequestPage(delta: number) {
  const nextPage = requestPager.page + delta;
  if (nextPage < 1 || nextPage > requestPageCount.value) {
    return;
  }
  requestPager.page = nextPage;
  void loadRequests();
}

function openCreateQuestion() {
  editorMode.value = 'create';
  selectedQuestionId.value = null;
  currentQuestionDetail.value = null;
  resetQuestionForm();
}

function openCreateCategory() {
  categoryEditorMode.value = 'create';
  selectedCategoryId.value = null;
  resetCategoryForm();
}

async function openEditQuestion(id: number) {
  editorMode.value = 'edit';
  selectedQuestionId.value = id;

  try {
    const detail = await getAdminQuestionDetail(id);
    currentQuestionDetail.value = detail;
    fillQuestionForm(detail);
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '题目详情加载失败');
  }
}

async function jumpToQuestionEditor(id: number) {
  activeTab.value = 'questions';
  await openEditQuestion(id);
}

function openEditCategory(item: AdminCategoryItem) {
  categoryEditorMode.value = 'edit';
  selectedCategoryId.value = item.id;
  fillCategoryForm(item);
}

async function submitQuestion() {
  if (!questionForm.categoryId || !questionForm.title.trim() || !questionForm.content.trim()) {
    setNotice('error', '分类、题目标题、题目内容为必填项');
    return;
  }

  savingQuestion.value = true;
  try {
    const payload = buildQuestionPayload();
    if (editorMode.value === 'create') {
      const created = await createAdminQuestion(payload);
      selectedQuestionId.value = created.id;
      currentQuestionDetail.value = created;
      fillQuestionForm(created);
      editorMode.value = 'edit';
      setNotice('success', `题目 #${created.id} 创建成功`);
    } else if (selectedQuestionId.value) {
      const updated = await updateAdminQuestion(selectedQuestionId.value, payload);
      currentQuestionDetail.value = updated;
      fillQuestionForm(updated);
      setNotice('success', `题目 #${updated.id} 已更新`);
    }

    await Promise.all([loadOverview(), loadQuestions(), loadRequests()]);
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '题目保存失败');
  } finally {
    savingQuestion.value = false;
  }
}

async function submitCategory() {
  if (!categoryForm.name.trim()) {
    setNotice('error', '分类名称不能为空');
    return;
  }

  savingCategory.value = true;
  try {
    const payload = buildCategoryPayload();
    if (categoryEditorMode.value === 'create') {
      const created = await createAdminCategory(payload);
      selectedCategoryId.value = created.id;
      fillCategoryForm(created);
      categoryEditorMode.value = 'edit';
      setNotice('success', `分类 #${created.id} 创建成功`);
    } else if (selectedCategoryId.value) {
      const updated = await updateAdminCategory(selectedCategoryId.value, payload);
      fillCategoryForm(updated);
      setNotice('success', `分类 #${updated.id} 已更新`);
    }

    await Promise.all([loadCategories(), loadAdminCategories(), loadOverview(), loadQuestions()]);
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '分类保存失败');
  } finally {
    savingCategory.value = false;
  }
}

async function updateRequestStatus(id: number, status: RequestStatus) {
  updatingRequestId.value = id;
  try {
    const result = await updateAdminExplanationRequestStatus(id, status);
    setNotice('success', `申请 #${result.id} 状态已更新为 ${getRequestStatusLabel(result.status)}`);
    await Promise.all([loadOverview(), loadRequests(), loadQuestions()]);
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '申请状态更新失败');
  } finally {
    updatingRequestId.value = null;
  }
}

async function syncRequest(id: number) {
  syncingRequestId.value = id;
  try {
    const result = await syncAdminExplanationRequest(id);
    setNotice('success', result.message);
    await Promise.all([loadOverview(), loadRequests()]);
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '同步 GitHub 失败');
  } finally {
    syncingRequestId.value = null;
  }
}

onMounted(async () => {
  resetQuestionForm();
  resetCategoryForm();
  await bootstrap();
});

onBeforeUnmount(() => {
  if (noticeTimer) {
    clearTimeout(noticeTimer);
  }
});
</script>

<template>
  <div class="layout">
    <header class="hero">
      <div>
        <h1>前端面试题库后台</h1>
        <p>集中管理分类、题目、系统讲解与用户申请，适合日常录入、运营排期和 GitHub 同步跟进。</p>
        <div class="hero__meta">
          <span class="hero-chip">题库运营面板</span>
          <span class="hero-chip">支持 GitHub Issue 同步</span>
          <span class="hero-chip">API：{{ apiBaseUrl }}</span>
          <span v-if="hasAdminToken" class="hero-chip">已启用后台 Token</span>
        </div>
      </div>
      <div class="hero__actions">
        <button class="primary-button" :disabled="loadingBootstrap" @click="bootstrap">
          {{ loadingBootstrap ? '刷新中...' : '刷新全部' }}
        </button>
        <button class="secondary-button" @click="openCreateQuestion">新建题目</button>
        <button class="secondary-button" @click="activeTab = 'categories'">分类管理</button>
      </div>
    </header>

    <section class="overview-grid">
      <article
        v-for="card in overviewCards"
        :key="card.label"
        class="overview-card"
        :class="{ 'overview-card--warn': card.tone === 'warn' }"
      >
        <span>{{ card.label }}</span>
        <strong>{{ loadingOverview ? '...' : card.value }}</strong>
      </article>
    </section>

    <div v-if="notice" class="notice" :class="`notice--${notice.type}`">
      {{ notice.text }}
    </div>

    <section class="panel">
      <div class="panel__tabs">
        <button
          :class="['tab-button', { 'tab-button--active': activeTab === 'questions' }]"
          @click="activeTab = 'questions'"
        >
          <span>题目管理</span>
          <span class="tab-count">{{ tabSummaries.questions }}</span>
        </button>
        <button
          :class="['tab-button', { 'tab-button--active': activeTab === 'requests' }]"
          @click="activeTab = 'requests'"
        >
          <span>讲解申请</span>
          <span class="tab-count">{{ tabSummaries.requests }}</span>
        </button>
        <button
          :class="['tab-button', { 'tab-button--active': activeTab === 'categories' }]"
          @click="activeTab = 'categories'"
        >
          <span>分类管理</span>
          <span class="tab-count">{{ tabSummaries.categories }}</span>
        </button>
      </div>

      <div v-if="activeTab === 'questions'" class="admin-grid">
        <div class="card">
          <div class="card__header">
            <div>
              <h2>题目列表</h2>
              <p class="helper-text">支持按关键词、分类、难度、发布状态、讲解状态快速筛选。</p>
            </div>
            <button class="ghost-button" :disabled="loadingQuestions" @click="loadQuestions">
              {{ loadingQuestions ? '刷新中...' : '刷新' }}
            </button>
          </div>

          <div class="filters filters--questions">
            <input
              v-model="questionFilters.keyword"
              class="input"
              placeholder="搜索题目 / 摘要"
              @keydown.enter="applyQuestionFilters"
            />
            <select v-model="questionFilters.categoryId" class="select">
              <option value="">全部分类</option>
              <option v-for="item in categories" :key="item.id" :value="String(item.id)">
                {{ item.name }}
              </option>
            </select>
            <select v-model="questionFilters.difficulty" class="select">
              <option value="">全部难度</option>
              <option v-for="item in difficultyOptions" :key="item" :value="item">
                {{ getDifficultyLabel(item) }}
              </option>
            </select>
            <select v-model="questionFilters.status" class="select">
              <option value="">全部状态</option>
              <option v-for="item in questionStatusOptions" :key="item" :value="item">
                {{ getQuestionStatusLabel(item) }}
              </option>
            </select>
            <select v-model="questionFilters.hasExplanation" class="select">
              <option value="">全部讲解状态</option>
              <option value="true">已有讲解</option>
              <option value="false">暂无讲解</option>
            </select>
            <div class="filters__actions">
              <button class="primary-button" @click="applyQuestionFilters">筛选</button>
              <button
                class="ghost-button"
                :disabled="!questionHasActiveFilters"
                @click="resetQuestionFilters"
              >
                清空
              </button>
            </div>
          </div>

          <div class="filter-summary">{{ questionFilterSummary }}</div>

          <div class="pager-bar">
            <span
              >第 {{ questionPager.page }} / {{ questionPageCount }} 页，共
              {{ questionPager.total }} 条</span
            >
            <div class="pager-bar__actions">
              <button
                class="ghost-button"
                :disabled="questionPager.page <= 1"
                @click="changeQuestionPage(-1)"
              >
                上一页
              </button>
              <button
                class="ghost-button"
                :disabled="questionPager.page >= questionPageCount"
                @click="changeQuestionPage(1)"
              >
                下一页
              </button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>题目</th>
                  <th>分类</th>
                  <th>难度 / 状态</th>
                  <th>讲解</th>
                  <th>申请</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingQuestions">
                  <td colspan="8">加载中...</td>
                </tr>
                <tr v-else-if="questions.length === 0">
                  <td colspan="8">暂无题目</td>
                </tr>
                <tr v-for="item in questions" :key="item.id">
                  <td>#{{ item.id }}</td>
                  <td>
                    <div class="cell-title">{{ item.title }}</div>
                    <div class="cell-sub">{{ item.summary || '暂无摘要' }}</div>
                    <div v-if="item.tags?.length" class="tag-list">
                      <span v-for="tag in item.tags" :key="tag" class="tag-chip">{{ tag }}</span>
                    </div>
                  </td>
                  <td>{{ item.category.name }}</td>
                  <td>
                    <div class="meta-stack">
                      <span :class="['status-tag', getDifficultyClass(item.difficulty)]">
                        {{ getDifficultyLabel(item.difficulty) }}
                      </span>
                      <span :class="['status-tag', getQuestionStatusClass(item.status)]">
                        {{ getQuestionStatusLabel(item.status) }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      :class="[
                        'status-tag',
                        item.hasExplanation ? 'status-tag--success' : 'status-tag--muted',
                      ]"
                    >
                      {{ item.hasExplanation ? '已有讲解' : '暂无讲解' }}
                    </span>
                    <div v-if="item.explanationUpdatedAt" class="cell-sub">
                      更新于 {{ formatDateTime(item.explanationUpdatedAt) }}
                    </div>
                  </td>
                  <td>
                    <template v-if="item.requestSummary">
                      <div class="meta-stack">
                        <span
                          :class="['status-tag', getRequestStatusClass(item.requestSummary.status)]"
                        >
                          {{ getRequestStatusLabel(item.requestSummary.status) }}
                        </span>
                        <span
                          :class="[
                            'status-tag',
                            getSyncStatusClass(item.requestSummary.syncStatus),
                          ]"
                        >
                          {{ getSyncStatusLabel(item.requestSummary.syncStatus) }}
                        </span>
                      </div>
                      <div class="cell-sub">{{ item.requestSummary.supportCount }} 人申请</div>
                    </template>
                    <span v-else>-</span>
                  </td>
                  <td>{{ formatDateTime(item.updatedAt) }}</td>
                  <td>
                    <button class="ghost-button" @click="openEditQuestion(item.id)">编辑</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h2>{{ questionEditorTitle }}</h2>
              <p class="helper-text">创建新题目，或补充系统讲解后让相关申请自动进入已完成状态。</p>
            </div>
            <button class="ghost-button" @click="openCreateQuestion">重置</button>
          </div>

          <div v-if="editorMode === 'edit' && currentQuestionDetail" class="editor-summary">
            <div class="editor-summary__header">
              <h3>当前题目概览</h3>
              <span
                class="status-tag"
                :class="getQuestionStatusClass(currentQuestionDetail.status)"
              >
                {{ getQuestionStatusLabel(currentQuestionDetail.status) }}
              </span>
            </div>
            <div class="editor-summary__grid">
              <div class="editor-summary__item">
                <span>题目 ID</span>
                <strong>#{{ currentQuestionDetail.id }}</strong>
              </div>
              <div class="editor-summary__item">
                <span>最近更新</span>
                <strong>{{ formatDateTime(currentQuestionDetail.updatedAt) }}</strong>
              </div>
              <div class="editor-summary__item">
                <span>讲解状态</span>
                <strong>
                  {{
                    currentQuestionDetail.explanationStatus
                      ? getExplanationStatusLabel(currentQuestionDetail.explanationStatus)
                      : '暂无讲解'
                  }}
                </strong>
              </div>
              <div class="editor-summary__item">
                <span>讲解更新时间</span>
                <strong>{{ formatDateTime(currentQuestionDetail.explanationUpdatedAt) }}</strong>
              </div>
              <div class="editor-summary__item">
                <span>申请同步</span>
                <strong>
                  {{
                    currentQuestionDetail.requestSummary
                      ? getSyncStatusLabel(currentQuestionDetail.requestSummary.syncStatus)
                      : '暂无申请'
                  }}
                </strong>
              </div>
              <div class="editor-summary__item">
                <span>GitHub Issue</span>
                <strong>
                  {{
                    currentQuestionDetail.requestSummary?.githubIssueNumber
                      ? `#${currentQuestionDetail.requestSummary.githubIssueNumber}`
                      : '未创建'
                  }}
                </strong>
              </div>
            </div>
          </div>

          <div class="form-grid">
            <label>
              <span>分类</span>
              <select v-model="questionForm.categoryId" class="select">
                <option v-for="item in categories" :key="item.id" :value="String(item.id)">
                  {{ item.name }}
                </option>
              </select>
            </label>
            <label>
              <span>难度</span>
              <select v-model="questionForm.difficulty" class="select">
                <option v-for="item in difficultyOptions" :key="item" :value="item">
                  {{ getDifficultyLabel(item) }}
                </option>
              </select>
            </label>
            <label>
              <span>发布状态</span>
              <select v-model="questionForm.status" class="select">
                <option v-for="item in questionStatusOptions" :key="item" :value="item">
                  {{ getQuestionStatusLabel(item) }}
                </option>
              </select>
            </label>
            <label>
              <span>讲解状态</span>
              <select v-model="questionForm.explanationStatus" class="select">
                <option v-for="item in explanationStatusOptions" :key="item" :value="item">
                  {{ getExplanationStatusLabel(item) }}
                </option>
              </select>
            </label>
            <label class="form-grid__full">
              <span>题目标题</span>
              <input v-model="questionForm.title" class="input" placeholder="请输入题目标题" />
            </label>
            <label class="form-grid__full">
              <span>题目摘要</span>
              <input
                v-model="questionForm.summary"
                class="input"
                placeholder="一句话概括题目要点"
              />
            </label>
            <label class="form-grid__full">
              <span>标签（逗号分隔）</span>
              <input
                v-model="questionForm.tagsText"
                class="input"
                placeholder="JavaScript, 闭包, 作用域"
              />
            </label>
            <label class="form-grid__full">
              <span>题目内容</span>
              <textarea
                v-model="questionForm.content"
                class="textarea textarea--large"
                placeholder="请输入题目正文"
              ></textarea>
            </label>
            <label class="form-grid__full">
              <span>参考答案</span>
              <textarea
                v-model="questionForm.answer"
                class="textarea"
                placeholder="请输入参考答案"
              ></textarea>
            </label>
            <label class="form-grid__full">
              <span>系统讲解内容</span>
              <textarea
                v-model="questionForm.explanationContent"
                class="textarea textarea--large"
                placeholder="有内容时会自动标记为“已有讲解”，并将关联申请置为 DONE；清空后会移除讲解。"
              ></textarea>
              <span class="field-tip">保存后会自动刷新题目列表、概览和讲解申请列表。</span>
            </label>
          </div>

          <div class="card__footer">
            <button class="primary-button" :disabled="savingQuestion" @click="submitQuestion">
              {{ savingQuestion ? '保存中...' : editorMode === 'create' ? '创建题目' : '保存修改' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'requests'" class="card">
        <div class="card__header">
          <div>
            <h2>讲解申请</h2>
            <p class="helper-text">优先处理待处理申请，必要时一键跳转到题目编辑页补充讲解内容。</p>
          </div>
          <button class="ghost-button" :disabled="loadingRequests" @click="loadRequests">
            {{ loadingRequests ? '刷新中...' : '刷新' }}
          </button>
        </div>

        <div class="filters filters--requests">
          <input
            v-model="requestFilters.keyword"
            class="input"
            placeholder="搜索题目 / 用户备注"
            @keydown.enter="applyRequestFilters"
          />
          <select v-model="requestFilters.status" class="select">
            <option value="">全部状态</option>
            <option v-for="item in requestStatusOptions" :key="item" :value="item">
              {{ getRequestStatusLabel(item) }}
            </option>
          </select>
          <select v-model="requestFilters.syncStatus" class="select">
            <option value="">全部同步状态</option>
            <option v-for="item in syncStatusOptions" :key="item" :value="item">
              {{ getSyncStatusLabel(item) }}
            </option>
          </select>
          <div class="filters__actions">
            <button class="primary-button" @click="applyRequestFilters">筛选</button>
            <button
              class="ghost-button"
              :disabled="!requestHasActiveFilters"
              @click="resetRequestFilters"
            >
              清空
            </button>
          </div>
        </div>

        <div class="filter-summary">{{ requestFilterSummary }}</div>

        <div class="pager-bar">
          <span
            >第 {{ requestPager.page }} / {{ requestPageCount }} 页，共
            {{ requestPager.total }} 条</span
          >
          <div class="pager-bar__actions">
            <button
              class="ghost-button"
              :disabled="requestPager.page <= 1"
              @click="changeRequestPage(-1)"
            >
              上一页
            </button>
            <button
              class="ghost-button"
              :disabled="requestPager.page >= requestPageCount"
              @click="changeRequestPage(1)"
            >
              下一页
            </button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>题目</th>
                <th>分类</th>
                <th>申请状态</th>
                <th>同步状态</th>
                <th>支持数</th>
                <th>用户备注</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingRequests">
                <td colspan="9">加载中...</td>
              </tr>
              <tr v-else-if="requests.length === 0">
                <td colspan="9">暂无申请</td>
              </tr>
              <tr v-for="item in requests" :key="item.id">
                <td>#{{ item.id }}</td>
                <td>
                  <div class="cell-title">{{ item.question.title }}</div>
                  <div class="cell-sub">题目 #{{ item.questionId }}</div>
                </td>
                <td>{{ item.question.category.name }}</td>
                <td>
                  <select
                    class="select select--small"
                    :value="item.status"
                    :disabled="updatingRequestId === item.id"
                    @change="
                      updateRequestStatus(
                        item.id,
                        ($event.target as HTMLSelectElement).value as RequestStatus,
                      )
                    "
                  >
                    <option v-for="status in requestStatusOptions" :key="status" :value="status">
                      {{ getRequestStatusLabel(status) }}
                    </option>
                  </select>
                </td>
                <td>
                  <span :class="['status-tag', getSyncStatusClass(item.syncStatus)]">
                    {{ getSyncStatusLabel(item.syncStatus) }}
                  </span>
                  <div v-if="item.githubIssueNumber" class="cell-sub">
                    Issue #{{ item.githubIssueNumber }}
                  </div>
                </td>
                <td>{{ item.supportCount }}</td>
                <td>{{ item.note || '-' }}</td>
                <td>
                  <div>{{ formatDateTime(item.updatedAt) }}</div>
                  <div class="cell-sub">提交于 {{ formatDateTime(item.lastSubmittedAt) }}</div>
                </td>
                <td>
                  <div class="action-stack">
                    <button class="ghost-button" @click="jumpToQuestionEditor(item.questionId)">
                      编辑题目
                    </button>
                    <button
                      class="ghost-button"
                      :disabled="
                        syncingRequestId === item.id || item.syncStatus === 'github_synced'
                      "
                      @click="syncRequest(item.id)"
                    >
                      {{
                        item.syncStatus === 'github_synced'
                          ? '已同步'
                          : syncingRequestId === item.id
                            ? '同步中...'
                            : '同步 GitHub'
                      }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="admin-grid admin-grid--categories">
        <div class="card">
          <div class="card__header">
            <div>
              <h2>分类列表</h2>
              <p class="helper-text">
                分类排序值越小越靠前，保存后题目编辑器里的分类选项会同步刷新。
              </p>
            </div>
            <div class="card__actions">
              <span class="table-meta">共 {{ adminCategories.length }} 个分类</span>
              <button
                class="ghost-button"
                :disabled="loadingCategories"
                @click="loadAdminCategories"
              >
                {{ loadingCategories ? '刷新中...' : '刷新' }}
              </button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>名称</th>
                  <th>排序</th>
                  <th>题目数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingCategories">
                  <td colspan="5">加载中...</td>
                </tr>
                <tr v-else-if="adminCategories.length === 0">
                  <td colspan="5">暂无分类</td>
                </tr>
                <tr v-for="item in adminCategories" :key="item.id">
                  <td>#{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.sort }}</td>
                  <td>{{ item._count?.questions ?? 0 }}</td>
                  <td>
                    <button class="ghost-button" @click="openEditCategory(item)">编辑</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h2>{{ categoryEditorTitle }}</h2>
              <p class="helper-text">适合快速补充新分类，或调整已有分类在题库中的展示顺序。</p>
            </div>
            <button class="ghost-button" @click="openCreateCategory">重置</button>
          </div>
          <div class="form-grid">
            <label class="form-grid__full">
              <span>分类名称</span>
              <input v-model="categoryForm.name" class="input" placeholder="请输入分类名称" />
            </label>
            <label>
              <span>排序</span>
              <input v-model="categoryForm.sort" class="input" type="number" min="0" />
              <span class="field-tip">越小越靠前；默认值为 0。</span>
            </label>
          </div>
          <div class="card__footer">
            <button class="primary-button" :disabled="savingCategory" @click="submitCategory">
              {{
                savingCategory
                  ? '保存中...'
                  : categoryEditorMode === 'create'
                    ? '创建分类'
                    : '保存分类'
              }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  background: #f5f7fa;
  color: #1f2329;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

* {
  box-sizing: border-box;
}

.layout {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.hero,
.card,
.overview-card,
.notice {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  padding: 28px;
  margin-bottom: 24px;
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.hero p {
  margin: 0;
  color: #667085;
  line-height: 1.6;
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.overview-card {
  padding: 20px;
}

.overview-card span {
  display: block;
  margin-bottom: 8px;
  color: #667085;
  font-size: 14px;
}

.overview-card strong {
  font-size: 28px;
}

.overview-card--warn {
  background: linear-gradient(135deg, #fff7e6, #fff1b8);
}

.notice {
  padding: 14px 18px;
  margin-bottom: 24px;
}

.notice--success {
  border: 1px solid #b7eb8f;
  color: #237804;
  background: #f6ffed;
}

.notice--error {
  border: 1px solid #ffccc7;
  color: #cf1322;
  background: #fff1f0;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tab-button,
.primary-button,
.secondary-button,
.ghost-button {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

.tab-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  color: #344054;
}

.tab-button--active {
  background: #1677ff;
  color: #fff;
}

.tab-count {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  font-size: 12px;
}

.tab-button--active .tab-count {
  background: rgba(255, 255, 255, 0.18);
}

.primary-button {
  padding: 12px 18px;
  background: #1677ff;
  color: #fff;
}

.primary-button:disabled,
.ghost-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-button,
.ghost-button {
  padding: 12px 18px;
  background: #f2f4f7;
  color: #344054;
}

.admin-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 1fr);
  gap: 20px;
}

.admin-grid--categories {
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.8fr);
}

.card {
  padding: 20px;
}

.card__header,
.card__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.card__header h2 {
  margin: 0;
  font-size: 18px;
}

.card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.helper-text,
.table-meta,
.field-tip {
  margin: 6px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.filters__actions {
  display: flex;
  gap: 12px;
}

.filter-summary {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475467;
  font-size: 13px;
}

.input,
.select,
.textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  background: #fff;
  font: inherit;
}

.select--small {
  min-width: 140px;
}

.textarea {
  min-height: 120px;
  resize: vertical;
}

.textarea--large {
  min-height: 180px;
}

.pager-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  color: #475467;
  font-size: 13px;
}

.pager-bar__actions,
.action-stack,
.meta-stack,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-stack {
  flex-direction: column;
  align-items: flex-start;
}

.table-wrap {
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px 10px;
  border-bottom: 1px solid #eaecf0;
  text-align: left;
  vertical-align: top;
}

.table th {
  font-size: 13px;
  color: #667085;
}

.cell-title {
  font-weight: 600;
}

.cell-sub {
  margin-top: 4px;
  color: #667085;
  font-size: 12px;
}

.tag-chip,
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.tag-chip {
  background: #f2f4f7;
  color: #344054;
}

.status-tag {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-tag--success {
  background: #ecfdf3;
  color: #027a48;
}

.status-tag--warn {
  background: #fff7e6;
  color: #d46b08;
}

.status-tag--muted {
  background: #f2f4f7;
  color: #667085;
}

.status-tag--info {
  background: #eef4ff;
  color: #1d4ed8;
}

.status-tag--danger {
  background: #fff1f3;
  color: #c01048;
}

.editor-summary {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
}

.editor-summary__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.editor-summary__header h3 {
  margin: 0;
  font-size: 15px;
}

.editor-summary__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.editor-summary__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.editor-summary__item span {
  color: #667085;
  font-size: 12px;
}

.editor-summary__item strong {
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-grid span {
  font-size: 13px;
  color: #475467;
}

.form-grid__full {
  grid-column: 1 / -1;
}

@media (max-width: 1200px) {
  .admin-grid,
  .admin-grid--categories {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .layout {
    padding: 16px;
  }

  .hero,
  .card {
    padding: 18px;
  }

  .hero {
    flex-direction: column;
    align-items: stretch;
  }

  .hero__actions,
  .card__header,
  .card__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-summary__grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .filters__actions,
  .pager-bar__actions {
    width: 100%;
  }
}
</style>
