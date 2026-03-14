import type { ApiResponse } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface RequestOptions<T> {
  url: string;
  method?: 'GET' | 'POST';
  data?: Record<string, unknown>;
}

export function request<T>(options: RequestOptions<T>) {
  return new Promise<T>((resolve, reject) => {
    uni.request<ApiResponse<T>>({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && res.data?.code === 0) {
          resolve(res.data.data);
          return;
        }

        reject(new Error(res.data?.message || '请求失败'));
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}
