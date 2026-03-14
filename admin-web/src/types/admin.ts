export interface CategoryItem {
  id: number;
  name: string;
  sort: number;
}

export interface AdminCategoryItem extends CategoryItem {
  _count?: {
    questions: number;
  };
}

export interface AdminOverview {
  categoryTotal: number;
  questionTotal: number;
  withExplanationCount: number;
  requestTotal: number;
  pendingRequestCount: number;
  localOnlyRequestCount: number;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ExplanationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CLOSED';
export type SyncStatus = 'github_synced' | 'local_only';

export interface AdminQuestionListItem {
  id: number;
  title: string;
  summary?: string | null;
  difficulty: Difficulty;
  status: QuestionStatus;
  tags?: string[];
  hasExplanation: boolean;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
  explanationUpdatedAt?: string | null;
  requestSummary?: {
    status: RequestStatus;
    supportCount: number;
    syncStatus: SyncStatus;
    githubIssueNumber?: number | null;
  } | null;
}

export interface AdminQuestionListResponse {
  list: AdminQuestionListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminQuestionDetail {
  id: number;
  categoryId: number;
  title: string;
  summary?: string | null;
  content: string;
  answer?: string | null;
  difficulty: Difficulty;
  tags?: string[];
  hasExplanation: boolean;
  status: QuestionStatus;
  explanationContent?: string | null;
  explanationStatus?: ExplanationStatus | null;
  explanationUpdatedAt?: string | null;
  requestSummary?: {
    id: number;
    status: RequestStatus;
    supportCount: number;
    githubIssueNumber?: number | null;
    syncStatus: SyncStatus;
    updatedAt: string;
  } | null;
}

export interface QuestionPayload {
  categoryId?: number;
  title?: string;
  summary?: string;
  content?: string;
  answer?: string;
  difficulty?: Difficulty;
  status?: QuestionStatus;
  tags?: string[];
  explanationContent?: string;
  explanationStatus?: ExplanationStatus;
}

export interface CategoryPayload {
  name: string;
  sort?: number;
}

export interface AdminExplanationRequestItem {
  id: number;
  questionId: number;
  note?: string | null;
  source: string;
  status: RequestStatus;
  supportCount: number;
  githubIssueNumber?: number | null;
  createdAt: string;
  updatedAt: string;
  lastSubmittedAt: string;
  syncStatus: SyncStatus;
  question: {
    id: number;
    title: string;
    hasExplanation: boolean;
    category: {
      id: number;
      name: string;
    };
  };
}

export interface AdminRequestListResponse {
  list: AdminExplanationRequestItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RequestStatusUpdateResult {
  id: number;
  status: RequestStatus;
  githubIssueNumber?: number | null;
  supportCount: number;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface SyncRequestResult {
  synced: boolean;
  syncStatus: SyncStatus;
  githubIssueNumber?: number | null;
  githubIssueId?: string | null;
  htmlUrl?: string;
  message: string;
}
