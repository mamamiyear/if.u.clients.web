// API 请求和响应类型定义

// 基础响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error_code: number;
  error_info?: string;
}

// 验证错误类型
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// 文本输入请求类型
export interface PostInputRequest {
  text: string;
}

// 人员信息请求类型
export interface PostPeopleRequest {
  people: Record<string, any>;
}

// 人员查询参数类型
export interface GetPeoplesParams {
  name?: string;
  gender?: string;
  age?: number;
  height?: number;
  marital_status?: string;
  limit?: number;
  offset?: number;
  search?: string;
  top_k?: number;
}

// 人员信息类型
export interface People {
  id?: string;
  name?: string;
  contact?: string;
  gender?: string;
  age?: number;
  height?: number;
  marital_status?: string;
  created_at?: number;
  [key: string]: any;
  cover?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// 用户相关类型

export interface SendCodeRequest {
  target_type: 'phone' | 'email';
  target: string;
  scene: 'register' | 'update';
}

export interface RegisterRequest {
  nickname?: string;
  avatar_link?: string;
  email?: string;
  phone?: string;
  password: string;
  code: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  created_at: string;
  nickname: string;
  avatar_link?: string;
}

export interface UpdateUserRequest {
  nickname?: string;
  avatar_link?: string;
  phone?: string;
  email?: string;
}

export interface UpdatePhoneRequest {
  phone: string;
  code: string;
}

export interface UpdateEmailRequest {
  email: string;
  code: string;
}