// API 请求和响应类型定义

// 基础响应类型
export interface ApiResponse<T = unknown> {
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
  people: People;
}

// 客户信息请求类型
export interface PostCustomRequest {
  custom: Custom;
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
  [key: string]: string | number | boolean | null | undefined;
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
  match_requirement?: string;
  cover?: string;
  introduction?: Record<string, string>;
  comments?: { remark?: { content: string; updated_at: number } };
}

// 客户信息类型
export interface Custom {
  id?: string;
  // 基本信息
  name: string;
  gender: string;
  birth: number; // int, 对应年龄转换
  marital?: string; // 婚姻状况
  phone?: string;
  email?: string;

  // 外貌信息
  height?: number;
  weight?: number;
  images?: string[]; // List[str]
  scores?: number;

  // 学历职业
  degree?: string;
  academy?: string;
  occupation?: string;
  income?: number;
  assets?: number;
  current_assets?: number; // 流动资产
  house?: string; // 房产情况
  car?: string; // 汽车情况

  // 户口家庭
  registered_city?: string; // 户籍城市
  live_city?: string; // 常住城市
  native_place?: string; // 籍贯
  original_family?: string;
  is_single_child?: boolean;

  match_requirement?: string;

  introductions?: Record<string, string>; // Dict[str, str]

  // 客户信息
  custom_level?: string; // '普通'，'VIP', '高级VIP'
  is_public?: boolean; // 是否公开
  comments?: Comment[];
}

export interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: number;
  updated_at: number;
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

export interface Organization {
  id: string;
  name: string;
  logo: string;
  role: string;
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  created_at: string;
  nickname: string;
  avatar_link?: string;
  organization?: Organization;
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
