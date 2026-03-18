export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface CategoryItem {
  id: number;
  name: string;
  sort: number;
}

export interface QuestionItem {
  id: number;
  title: string;
  summary?: string | null;
  difficulty: Difficulty;
  tags?: string[];
  hasExplanation: boolean;
  category: {
    id: number;
    name: string;
  };
}

export interface QuestionListResult {
  list: QuestionItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type ExplanationSource = 'file' | 'database' | null;

export interface QuestionDetail extends QuestionItem {
  content: string;
  answer?: string | null;
  explanationContent?: string | null;
  explanationRenderedHtml?: string | null;
  explanationUpdatedAt?: string | null;
  explanationSource?: ExplanationSource;
  explanationFilePath?: string | null;
}

export interface QuestionRequestStatus {
  hasExplanation: boolean;
  hasRequest: boolean;
  status?: string;
  supportCount: number;
  githubIssueNumber?: number | null;
}
