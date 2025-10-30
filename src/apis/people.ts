// 人员管理相关 API

import { get, post, del } from './request';
import { API_ENDPOINTS } from './config';
import type { 
  PostPeopleRequest, 
  GetPeoplesParams, 
  People, 
  ApiResponse,
  PaginatedResponse 
} from './types';

/**
 * 创建人员信息
 * @param people 人员信息对象
 * @returns Promise<ApiResponse>
 */
export async function createPeople(people: People): Promise<ApiResponse> {
  const requestData: PostPeopleRequest = { people };
  console.log('创建人员请求数据:', requestData);
  return post<ApiResponse>(API_ENDPOINTS.PEOPLES, requestData);
}

/**
 * 查询人员列表
 * @param params 查询参数
 * @returns Promise<ApiResponse<People[]>>
 */
export async function getPeoples(params?: GetPeoplesParams): Promise<ApiResponse<People[]>> {
  return get<ApiResponse<People[]>>(API_ENDPOINTS.PEOPLES, params);
}

/**
 * 搜索人员
 * @param searchText 搜索关键词
 * @param topK 返回结果数量，默认5
 * @returns Promise<ApiResponse<People[]>>
 */
export async function searchPeoples(
  searchText: string, 
  topK = 5
): Promise<ApiResponse<People[]>> {
  const params: GetPeoplesParams = {
    search: searchText,
    top_k: topK,
  };
  return get<ApiResponse<People[]>>(API_ENDPOINTS.PEOPLES, params);
}

/**
 * 按条件筛选人员
 * @param filters 筛选条件
 * @returns Promise<ApiResponse<People[]>>
 */
export async function filterPeoples(filters: {
  name?: string;
  gender?: string;
  age?: number;
  height?: number;
  marital_status?: string;
}): Promise<ApiResponse<People[]>> {
  const params: GetPeoplesParams = {
    ...filters,
    limit: 50, // 默认返回50条
  };
  return get<ApiResponse<People[]>>(API_ENDPOINTS.PEOPLES, params);
}

/**
 * 分页获取人员列表
 * @param page 页码（从1开始）
 * @param pageSize 每页数量，默认10
 * @param filters 可选的筛选条件
 * @returns Promise<ApiResponse<PaginatedResponse<People>>>
 */
export async function getPeoplesPaginated(
  page = 1,
  pageSize = 10,
  filters?: Partial<GetPeoplesParams>
): Promise<ApiResponse<PaginatedResponse<People>>> {
  const params: GetPeoplesParams = {
    ...filters,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
  
  const response = await get<ApiResponse<People[]>>(API_ENDPOINTS.PEOPLES, params);
  
  // 将响应转换为分页格式
  const paginatedResponse: PaginatedResponse<People> = {
    items: response.data || [],
    total: response.data?.length || 0, // 注意：实际项目中应该从后端获取总数
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
  
  return {
    ...response,
    data: paginatedResponse,
  };
}

/**
 * 删除人员信息
 * @param peopleId 人员ID
 * @returns Promise<ApiResponse>
 */
export async function deletePeople(peopleId: string): Promise<ApiResponse> {
  return del<ApiResponse>(API_ENDPOINTS.PEOPLE_BY_ID(peopleId));
}

/**
 * 批量创建人员信息
 * @param peopleList 人员信息数组
 * @returns Promise<ApiResponse[]>
 */
export async function createPeoplesBatch(
  peopleList: People[]
): Promise<ApiResponse[]> {
  const promises = peopleList.map(people => createPeople(people));
  return Promise.all(promises);
}

/**
 * 高级搜索人员
 * @param options 搜索选项
 * @returns Promise<ApiResponse<People[]>>
 */
export async function advancedSearchPeoples(options: {
  searchText?: string;
  filters?: {
    name?: string;
    gender?: string;
    ageRange?: { min?: number; max?: number };
    heightRange?: { min?: number; max?: number };
    marital_status?: string;
  };
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  topK?: number;
}): Promise<ApiResponse<People[]>> {
  const { searchText, filters = {}, pagination = {}, topK = 10 } = options;
  const { page = 1, pageSize = 10 } = pagination;
  
  const params: GetPeoplesParams = {
    search: searchText,
    name: filters.name,
    gender: filters.gender,
    marital_status: filters.marital_status,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    top_k: topK,
  };
  
  // 处理年龄范围（这里简化处理，实际可能需要后端支持范围查询）
  if (filters.ageRange?.min !== undefined) {
    params.age = filters.ageRange.min;
  }
  
  // 处理身高范围（这里简化处理，实际可能需要后端支持范围查询）
  if (filters.heightRange?.min !== undefined) {
    params.height = filters.heightRange.min;
  }
  
  return get<ApiResponse<People[]>>(API_ENDPOINTS.PEOPLES, params);
}