import type {
  CreateExplanationRequestPayload,
  CreateExplanationRequestResult,
} from '@/types/request';

import { request } from './http';

export function createExplanationRequest(data: CreateExplanationRequestPayload) {
  return request<CreateExplanationRequestResult>({
    url: '/explanation-requests',
    method: 'POST',
    data,
  });
}
