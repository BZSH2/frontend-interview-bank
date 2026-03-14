import type {
  AdminCategoryItem,
  AdminOverview,
  AdminQuestionDetail,
  AdminQuestionListResponse,
  AdminRequestListResponse,
  CategoryItem,
  CategoryPayload,
  QuestionPayload,
  RequestStatus,
  RequestStatusUpdateResult,
  SyncRequestResult,
} from '@/types/admin';

import { request } from './http';

export function getAdminOverview() {
  return request<AdminOverview>('/admin/overview');
}

export function getCategories() {
  return request<CategoryItem[]>('/categories');
}

export function getAdminCategories() {
  return request<AdminCategoryItem[]>('/admin/categories');
}

export function createAdminCategory(payload: CategoryPayload) {
  return request<AdminCategoryItem>('/admin/categories', {
    method: 'POST',
    body: payload,
  });
}

export function updateAdminCategory(id: number, payload: Partial<CategoryPayload>) {
  return request<AdminCategoryItem>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function getAdminQuestions(params: Record<string, unknown>) {
  return request<AdminQuestionListResponse>('/admin/questions', { params });
}

export function getAdminQuestionDetail(id: number) {
  return request<AdminQuestionDetail>(`/admin/questions/${id}`);
}

export function createAdminQuestion(payload: QuestionPayload) {
  return request<AdminQuestionDetail>('/admin/questions', {
    method: 'POST',
    body: payload,
  });
}

export function updateAdminQuestion(id: number, payload: QuestionPayload) {
  return request<AdminQuestionDetail>(`/admin/questions/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function getAdminExplanationRequests(params: Record<string, unknown>) {
  return request<AdminRequestListResponse>('/admin/explanation-requests', { params });
}

export function updateAdminExplanationRequestStatus(id: number, status: RequestStatus) {
  return request<RequestStatusUpdateResult>(`/admin/explanation-requests/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export function syncAdminExplanationRequest(id: number) {
  return request<SyncRequestResult>(`/admin/explanation-requests/${id}/sync`, {
    method: 'POST',
  });
}
