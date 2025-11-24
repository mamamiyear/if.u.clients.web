// 基础请求工具函数

import { API_CONFIG } from './config';

// 请求选项接口
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

// 自定义错误类
export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 基础请求函数
export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_CONFIG.TIMEOUT,
  } = options;

  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const requestHeaders: Record<string, string> = {
      ...API_CONFIG.HEADERS,
      ...headers,
    };

    let requestBody: string | FormData | undefined;
    
    if (body instanceof FormData) {
      // 对于 FormData，不设置 Content-Type，让浏览器自动设置
      delete requestHeaders['Content-Type'];
      requestBody = body;
    } else if (body) {
      requestBody = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: requestBody,
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      let messageText = `HTTP ${response.status}: ${response.statusText}`;
      if (errorData && typeof errorData === 'object') {
        const maybe = errorData as { message?: string };
        messageText = maybe.message ?? messageText;
      }
      throw new ApiError(messageText, response.status, errorData);
    }

    // 检查响应是否有内容
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // 如果没有 JSON 内容，返回空对象
      return {} as T;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('请求超时', 408);
      }
      throw new ApiError(error.message);
    }
    
    throw new ApiError('未知错误');
  }
}

// GET 请求
type QueryParamValue = string | number | boolean | null | undefined;
export function get<T = unknown>(url: string, params?: Record<string, QueryParamValue>): Promise<T> {
  let fullUrl = url;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (url.includes('?') ? '&' : '?') + queryString;
    }
  }
  
  return request<T>(fullUrl, { method: 'GET' });
}

// POST 请求
export function post<T = unknown>(url: string, data?: unknown, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: data,
    ...options,
  });
}

// PUT 请求
export function put<T = unknown>(url: string, data?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: data,
  });
}

// DELETE 请求
export function del<T = unknown>(url: string): Promise<T> {
  return request<T>(url, { method: 'DELETE' });
}

// 文件上传请求
export function upload<T = unknown>(url: string, file: File, fieldName = 'file', options?: Partial<RequestOptions>): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  return request<T>(url, {
    method: 'POST',
    body: formData,
    ...options,
  });
}