import type { ApiResponse } from '@/types/api';
import { getOrCreateUserKey } from '@/utils/user';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  data?: object | string | ArrayBuffer;
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const message = Reflect.get(payload, 'message');
  if (Array.isArray(message)) {
    return message.join('；');
  }

  if (typeof message === 'string' && message) {
    return message;
  }

  return fallback;
}

export function request<T>(options: RequestOptions) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data as Record<string, unknown> | string | ArrayBuffer | undefined,
      timeout: 10000,
      header: {
        'x-user-key': getOrCreateUserKey(),
      },
      success: (res: UniApp.RequestSuccessCallbackResult) => {
        const response = res.data as ApiResponse<T> | Record<string, unknown> | undefined;

        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (response && typeof response === 'object' && Reflect.get(response, 'code') === 0) {
            resolve((response as ApiResponse<T>).data);
            return;
          }

          reject(new Error(extractErrorMessage(response, '请求失败')));
          return;
        }

        reject(new Error(extractErrorMessage(response, `请求失败（${res.statusCode}）`)));
      },
      fail: (error: UniApp.GeneralCallbackResult) => {
        reject(new Error(error.errMsg || '网络异常，请稍后重试'));
      },
    });
  });
}
