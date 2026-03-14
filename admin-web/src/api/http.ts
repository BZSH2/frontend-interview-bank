interface WrappedResponse<T> {
  code: number;
  message: string;
  data: T;
  requestId?: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || '';

function buildQuery(params?: Record<string, unknown>) {
  if (!params) {
    return '';
  }

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function request<T>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PATCH';
    params?: Record<string, unknown>;
    body?: unknown;
  },
) {
  const response = await fetch(`${BASE_URL}${url}${buildQuery(options?.params)}`, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(ADMIN_TOKEN ? { 'x-admin-token': ADMIN_TOKEN } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json()) as WrappedResponse<T> | { message?: string | string[] };

  if (!response.ok) {
    const rawMessage = 'message' in payload ? payload.message : '请求失败';
    const message = Array.isArray(rawMessage) ? rawMessage.join('；') : rawMessage;

    if (response.status === 401) {
      throw new Error(message || '后台鉴权失败，请检查 ADMIN_TOKEN / VITE_ADMIN_TOKEN 配置');
    }

    throw new Error(message || `请求失败（${response.status}）`);
  }

  if ('code' in payload && payload.code === 0) {
    return payload.data;
  }

  throw new Error('接口返回格式异常');
}
