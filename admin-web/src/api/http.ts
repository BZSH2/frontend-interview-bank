interface WrappedResponse<T> {
  code: number;
  message: string;
  data: T;
  requestId?: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json()) as WrappedResponse<T> | { message?: string | string[] };

  if (!response.ok) {
    const rawMessage = 'message' in payload ? payload.message : '请求失败';
    const message = Array.isArray(rawMessage) ? rawMessage.join('；') : rawMessage;
    throw new Error(message || `请求失败（${response.status}）`);
  }

  if ('code' in payload && payload.code === 0) {
    return payload.data;
  }

  throw new Error('接口返回格式异常');
}
