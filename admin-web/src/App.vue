<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import {
  createAdminQuestion,
  getAdminExplanationRequests,
  getAdminOverview,
  getAdminQuestionDetail,
  getAdminQuestions,
  getCategories,
  syncAdminExplanationRequest,
  updateAdminExplanationRequestStatus,
  updateAdminQuestion,
} from '@/api/admin';
import type {
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
const questions = ref<AdminQuestionListItem[]>([]);
const requests = ref<AdminExplanationRequestItem[]>([]);

const loadingOverview = ref(false);
const loadingQuestions = ref(false);
const loadingRequests = ref(false);
const savingQuestion = ref(false);
const syncingRequestId = ref<number | null>(null);
const updatingRequestId = ref<number | null>(null);

const activeTab = ref<'questions' | 'requests'>('questions');
const notice = ref<{ type: 'success' | 'error'; text: string } | null>(null);

const questionFilters = reactive({
  keyword: '',
  categoryId: '',
  hasExplanation: '',
});

const requestFilters = reactive({
  keyword: '',
  status: '',
  syncStatus: '',
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

const difficultyOptions: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
const questionStatusOptions: QuestionStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const explanationStatusOptions: ExplanationStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const requestStatusOptions: RequestStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'CLOSED'];
const syncStatusOptions: SyncStatus[] = ['local_only', 'github_synced'];

const questionEditorTitle = computed(() =>
  editorMode.value === 'create' ? '新建题目' : `编辑题目 #${selectedQuestionId.value}`,
);

function setNotice(type: 'success' | 'error', text: string) {
  notice.value = { type, text };
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
    explanationContent: questionForm.explanationContent,
    explanationStatus: questionForm.explanationStatus,
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
  categories.value = await getCategories();
  if (!questionForm.categoryId && categories.value[0]) {
    questionForm.categoryId = String(categories.value[0].id);
  }
}

async function loadQuestions() {
  loadingQuestions.value = true;
  try {
    const result = await getAdminQuestions({
      page: 1,
      pageSize: 20,
      keyword: questionFilters.keyword,
      categoryId: questionFilters.categoryId,
      hasExplanation: questionFilters.hasExplanation,
    });
    questions.value = result.list;
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
      page: 1,
      pageSize: 20,
      keyword: requestFilters.keyword,
      status: requestFilters.status,
      syncStatus: requestFilters.syncStatus,
    });
    requests.value = result.list;
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '申请列表加载失败');
  } finally {
    loadingRequests.value = false;
  }
}

async function bootstrap() {
  await Promise.all([loadCategories(), loadOverview(), loadQuestions(), loadRequests()]);
}

async function openCreateQuestion() {
  editorMode.value = 'create';
  selectedQuestionId.value = null;
  resetQuestionForm();
}

async function openEditQuestion(id: number) {
  editorMode.value = 'edit';
  selectedQuestionId.value = id;

  try {
    const detail = await getAdminQuestionDetail(id);
    fillQuestionForm(detail);
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '题目详情加载失败');
  }
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
      fillQuestionForm(created);
      editorMode.value = 'edit';
      setNotice('success', `题目 #${created.id} 创建成功`);
    } else if (selectedQuestionId.value) {
      const updated = await updateAdminQuestion(selectedQuestionId.value, payload);
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

async function updateRequestStatus(id: number, status: RequestStatus) {
  updatingRequestId.value = id;
  try {
    const result = await updateAdminExplanationRequestStatus(id, status);
    setNotice('success', `申请 #${result.id} 状态已更新为 ${result.status}`);
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
  await bootstrap();
});
</script>

<template>
  <div class="layout">
    <header class="hero">
      <div>
        <h1>前端面试题库后台</h1>
        <p>管理题目、讲解内容与用户讲解申请，支持后续同步 GitHub。</p>
      </div>
      <div class="hero__actions">
        <button class="primary-button" @click="bootstrap">刷新全部</button>
        <button class="secondary-button" @click="openCreateQuestion">新建题目</button>
      </div>
    </header>

    <section class="overview-grid">
      <article class="overview-card">
        <span>题目总数</span>
        <strong>{{ loadingOverview ? '...' : (overview?.questionTotal ?? '-') }}</strong>
      </article>
      <article class="overview-card">
        <span>已有讲解</span>
        <strong>{{ loadingOverview ? '...' : (overview?.withExplanationCount ?? '-') }}</strong>
      </article>
      <article class="overview-card">
        <span>申请总数</span>
        <strong>{{ loadingOverview ? '...' : (overview?.requestTotal ?? '-') }}</strong>
      </article>
      <article class="overview-card">
        <span>待处理申请</span>
        <strong>{{ loadingOverview ? '...' : (overview?.pendingRequestCount ?? '-') }}</strong>
      </article>
      <article class="overview-card overview-card--warn">
        <span>待同步 GitHub</span>
        <strong>{{ loadingOverview ? '...' : (overview?.localOnlyRequestCount ?? '-') }}</strong>
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
          题目管理
        </button>
        <button
          :class="['tab-button', { 'tab-button--active': activeTab === 'requests' }]"
          @click="activeTab = 'requests'"
        >
          讲解申请
        </button>
      </div>

      <div v-if="activeTab === 'questions'" class="admin-grid">
        <div class="card">
          <div class="card__header">
            <h2>题目列表</h2>
            <button class="ghost-button" @click="loadQuestions">刷新</button>
          </div>

          <div class="filters">
            <input v-model="questionFilters.keyword" class="input" placeholder="搜索题目 / 摘要" />
            <select v-model="questionFilters.categoryId" class="select">
              <option value="">全部分类</option>
              <option v-for="item in categories" :key="item.id" :value="String(item.id)">
                {{ item.name }}
              </option>
            </select>
            <select v-model="questionFilters.hasExplanation" class="select">
              <option value="">全部讲解状态</option>
              <option value="true">已有讲解</option>
              <option value="false">暂无讲解</option>
            </select>
            <button class="primary-button" @click="loadQuestions">筛选</button>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>题目</th>
                  <th>分类</th>
                  <th>难度</th>
                  <th>讲解</th>
                  <th>申请</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingQuestions">
                  <td colspan="7">加载中...</td>
                </tr>
                <tr v-else-if="questions.length === 0">
                  <td colspan="7">暂无题目</td>
                </tr>
                <tr v-for="item in questions" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>
                    <div class="cell-title">{{ item.title }}</div>
                    <div class="cell-sub">{{ item.summary || '-' }}</div>
                  </td>
                  <td>{{ item.category.name }}</td>
                  <td>{{ item.difficulty }}</td>
                  <td>
                    <span
                      :class="[
                        'status-tag',
                        item.hasExplanation ? 'status-tag--success' : 'status-tag--muted',
                      ]"
                    >
                      {{ item.hasExplanation ? '已有讲解' : '暂无讲解' }}
                    </span>
                  </td>
                  <td>
                    <template v-if="item.requestSummary">
                      <div>{{ item.requestSummary.status }}</div>
                      <div class="cell-sub">{{ item.requestSummary.supportCount }} 人申请</div>
                    </template>
                    <span v-else>-</span>
                  </td>
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
            <h2>{{ questionEditorTitle }}</h2>
            <button class="ghost-button" @click="openCreateQuestion">重置</button>
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
                  {{ item }}
                </option>
              </select>
            </label>

            <label>
              <span>发布状态</span>
              <select v-model="questionForm.status" class="select">
                <option v-for="item in questionStatusOptions" :key="item" :value="item">
                  {{ item }}
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

            <label>
              <span>讲解状态</span>
              <select v-model="questionForm.explanationStatus" class="select">
                <option v-for="item in explanationStatusOptions" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
            </label>

            <label class="form-grid__full">
              <span>系统讲解内容</span>
              <textarea
                v-model="questionForm.explanationContent"
                class="textarea textarea--large"
                placeholder="有内容时会自动标记该题为“已有讲解”，并将关联申请置为 DONE"
              ></textarea>
            </label>
          </div>

          <div class="card__footer">
            <button class="primary-button" :disabled="savingQuestion" @click="submitQuestion">
              {{ savingQuestion ? '保存中...' : editorMode === 'create' ? '创建题目' : '保存修改' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="card">
        <div class="card__header">
          <h2>讲解申请</h2>
          <button class="ghost-button" @click="loadRequests">刷新</button>
        </div>

        <div class="filters">
          <input v-model="requestFilters.keyword" class="input" placeholder="搜索题目 / 用户备注" />
          <select v-model="requestFilters.status" class="select">
            <option value="">全部状态</option>
            <option v-for="item in requestStatusOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <select v-model="requestFilters.syncStatus" class="select">
            <option value="">全部同步状态</option>
            <option v-for="item in syncStatusOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <button class="primary-button" @click="loadRequests">筛选</button>
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
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingRequests">
                <td colspan="8">加载中...</td>
              </tr>
              <tr v-else-if="requests.length === 0">
                <td colspan="8">暂无申请</td>
              </tr>
              <tr v-for="item in requests" :key="item.id">
                <td>{{ item.id }}</td>
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
                      {{ status }}
                    </option>
                  </select>
                </td>
                <td>
                  <span
                    :class="[
                      'status-tag',
                      item.syncStatus === 'github_synced'
                        ? 'status-tag--success'
                        : 'status-tag--warn',
                    ]"
                  >
                    {{ item.syncStatus }}
                  </span>
                  <div v-if="item.githubIssueNumber" class="cell-sub">
                    Issue #{{ item.githubIssueNumber }}
                  </div>
                </td>
                <td>{{ item.supportCount }}</td>
                <td>{{ item.note || '-' }}</td>
                <td>
                  <button
                    class="ghost-button"
                    :disabled="syncingRequestId === item.id || item.syncStatus === 'github_synced'"
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
                </td>
              </tr>
            </tbody>
          </table>
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
}

.hero__actions {
  display: flex;
  gap: 12px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
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
  padding: 12px 16px;
  background: #fff;
  color: #344054;
}

.tab-button--active {
  background: #1677ff;
  color: #fff;
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
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
}

.card {
  padding: 20px;
}

.card__header,
.card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.card__header h2 {
  margin: 0;
  font-size: 18px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
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

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
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
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-grid {
    grid-template-columns: 1fr;
  }
}
</style>
