// 文本输入相关 API

import { post } from './request';
import { API_ENDPOINTS } from './config';
import type { PostInputRequest, ApiResponse } from './types';

/**
 * 提交文本输入
 * @param text 输入的文本内容
 * @returns Promise<ApiResponse>
 */
export async function postInput(text: string): Promise<ApiResponse> {
  const requestData: PostInputRequest = { text };
  // 为 postInput 设置 30 秒超时时间
  return post<ApiResponse>(API_ENDPOINTS.INPUT, requestData, { timeout: 30000 });
}

/**
 * 提交文本输入（使用对象参数）
 * @param data 包含文本的请求对象
 * @returns Promise<ApiResponse>
 */
export async function postInputData(data: PostInputRequest): Promise<ApiResponse> {
  // 为 postInputData 设置 30 秒超时时间
  return post<ApiResponse>(API_ENDPOINTS.INPUT, data, { timeout: 30000 });
}