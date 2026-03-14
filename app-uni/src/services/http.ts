import type { ApiResponse } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  data?: object | string | ArrayBuffer;
}

export function request<T>(options: RequestOptions) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data as Record<string, unknown> | string | ArrayBuffer | undefined,
      success: (res: UniApp.RequestSuccessCallbackResult) => {
        const response = res.data as ApiResponse<T> | undefined;

        if (res.statusCode >= 200 && res.statusCode < 300 && response?.code === 0) {
          resolve(response.data);
          return;
        }

        reject(new Error(response?.message || '请求失败'));
      },
      fail: (error: UniApp.GeneralCallbackResult) => {
        reject(error);
      },
    });
  });
}
