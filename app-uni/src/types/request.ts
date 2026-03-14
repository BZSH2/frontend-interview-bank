export interface CreateExplanationRequestPayload {
  questionId: number;
  note?: string;
  source?: 'MINIAPP' | 'H5' | 'PC';
}

export interface CreateExplanationRequestResult {
  success: boolean;
  mode: 'CREATED' | 'MERGED';
  syncStatus: 'github_synced' | 'local_only';
  message: string;
  githubIssueNumber?: number | null;
  supportCount: number;
}
