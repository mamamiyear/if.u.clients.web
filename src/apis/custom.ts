// 客户管理相关 API

import { get, post, put, del, upload } from './request';
import { API_ENDPOINTS } from './config';
import type { 
  PostCustomRequest, 
  Custom, 
  ApiResponse,
  PaginatedResponse,
  Comment,
} from './types';

/**
 * 获取客户列表
 * @param params 查询参数
 * @returns Promise<ApiResponse<PaginatedResponse<Custom>>>
 */
export async function getCustoms(params?: Record<string, string | number>): Promise<ApiResponse<PaginatedResponse<Custom>>> {
  const response = await get<ApiResponse<Custom[] | PaginatedResponse<Custom>>>(API_ENDPOINTS.CUSTOMS, params);

  // 兼容处理：如果后端返回的是数组，封装为分页结构
  if (Array.isArray(response.data)) {
    return {
      ...response,
      data: {
        items: response.data,
        total: response.data.length,
        limit: Number(params?.limit) || 1000,
        offset: Number(params?.offset) || 0,
      }
    };
  }

  // 如果后端返回的就是分页结构，直接返回
  return response as ApiResponse<PaginatedResponse<Custom>>;
}

/**
 * 创建客户信息
 * @param custom 客户信息对象
 * @returns Promise<ApiResponse>
 */
export async function createCustom(custom: Custom): Promise<ApiResponse> {
  const requestData: PostCustomRequest = { custom };
  console.log('创建客户请求数据:', requestData);
  return post<ApiResponse>(API_ENDPOINTS.CUSTOM, requestData);
}

/**
 * 更新客户信息
 * @param id 客户ID
 * @param custom 客户信息对象
 * @returns Promise<ApiResponse>
 */
export async function updateCustom(id: string, custom: Custom): Promise<ApiResponse> {
  const requestData: PostCustomRequest = { custom };
  return put<ApiResponse>(`${API_ENDPOINTS.CUSTOM}/${id}`, requestData);
}

/**
 * 删除客户
 * @param id 客户ID
 * @returns Promise<ApiResponse>
 */
export async function deleteCustom(id: string): Promise<ApiResponse> {
  return del<ApiResponse>(`${API_ENDPOINTS.CUSTOM}/${id}`);
}

/**
 * 上传客户图片
 * @param id 客户ID
 * @param file 图片文件
 * @returns Promise<ApiResponse<string>>
 */
export async function uploadCustomImage(id: string, file: File): Promise<ApiResponse<string>> {
  return upload<ApiResponse<string>>(API_ENDPOINTS.CUSTOM_IMAGE_BY_ID(id), file, 'image');
}

/**
 * 添加客户评论
 * @param customId 客户ID
 * @param content 评论内容
 * @returns Promise<ApiResponse>
 */
export async function addCustomComment(customId: string, content: string): Promise<ApiResponse> {
  return post<ApiResponse>(API_ENDPOINTS.CUSTOM_COMMENT_BY_ID(customId), { content });
}

/**
 * 获取客户评论列表
 * @param customId 客户ID
 * @returns Promise<ApiResponse<Comment[]>>
 */
export async function getCustomComments(customId: string): Promise<ApiResponse<Comment[]>> {
  return get<ApiResponse<Comment[]>>(API_ENDPOINTS.CUSTOM_COMMENTS_BY_ID(customId));
}

/**
 * 更新客户评论
 * @param customId 客户ID
 * @param commentId 评论ID
 * @param content 评论内容
 * @returns Promise<ApiResponse>
 */
export async function updateCustomComment(customId: string, commentId: string, content: string): Promise<ApiResponse> {
  return put<ApiResponse>(API_ENDPOINTS.CUSTOM_COMMENT_UPDATE_DELETE(customId, commentId), { content });
}

/**
 * 删除客户评论
 * @param customId 客户ID
 * @param commentId 评论ID
 * @returns Promise<ApiResponse>
 */
export async function deleteCustomComment(customId: string, commentId: string): Promise<ApiResponse> {
  return del<ApiResponse>(API_ENDPOINTS.CUSTOM_COMMENT_UPDATE_DELETE(customId, commentId));
}
