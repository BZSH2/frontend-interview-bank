export interface GithubExplanationIssuePayload {
  questionId: number;
  title: string;
  note?: string;
  source: string;
}

export function buildGithubIssueTitle(payload: GithubExplanationIssuePayload) {
  return `[讲解申请] 题目#${payload.questionId} - ${payload.title}`;
}

export function buildGithubIssueBody(payload: GithubExplanationIssuePayload) {
  return [
    '## 基本信息',
    `- Question ID: ${payload.questionId}`,
    `- Title: ${payload.title}`,
    `- Source: ${payload.source}`,
    '',
    '## 用户备注',
    payload.note || '无',
    '',
    '## 系统时间',
    `- Submitted At: ${new Date().toISOString()}`,
  ].join('\n');
}
