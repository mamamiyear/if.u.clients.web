import { get, post, put, del } from './request';
import { API_ENDPOINTS } from './config';
import type { SendCodeRequest, RegisterRequest, LoginRequest, User, ApiResponse, UpdateUserRequest, UpdatePhoneRequest, UpdateEmailRequest } from './types';

/**
 * 发送验证码
 * @param phone 手机号
 * @param usage 用途
 * @returns Promise<ApiResponse>
 */
export async function sendCode(data: SendCodeRequest): Promise<ApiResponse> {
  return post<ApiResponse>(API_ENDPOINTS.SEND_CODE, data);
}

/**
 * 用户注册
 * @param data 注册信息
 * @returns Promise<ApiResponse>
 */
export async function register(data: RegisterRequest): Promise<ApiResponse> {
  return post<ApiResponse>(API_ENDPOINTS.REGISTER, data);
}

/**
 * 用户登录
 * @param data 登录信息
 * @returns Promise<ApiResponse<{token: string}>>
 */
export async function login(data: LoginRequest): Promise<ApiResponse<{token: string}>> {
  return post<ApiResponse<{token: string}>>(API_ENDPOINTS.LOGIN, data);
}

/**
 * 用户登出
 * @returns Promise<ApiResponse>
 */
export async function logout(): Promise<ApiResponse> {
  return del<ApiResponse>(API_ENDPOINTS.LOGOUT);
}

/**
 * 获取当前用户信息
 * @returns Promise<ApiResponse<User>>
 */
export async function getMe(): Promise<ApiResponse<User>> {
  return get<ApiResponse<User>>(API_ENDPOINTS.ME);
}

/**
 * 更新用户信息
 * @param data 要更新的用户信息
 * @returns Promise<ApiResponse<User>>
 */
export async function updateMe(data: UpdateUserRequest): Promise<ApiResponse<User>> {
  return put<ApiResponse<User>>(API_ENDPOINTS.ME, data);
}

/**
 * 用户注销
 * @returns Promise<ApiResponse>
 */
export async function deleteUser(): Promise<ApiResponse> {
  return del<ApiResponse>(API_ENDPOINTS.DELETE_USER);
}

/**
 * 更新用户头像
 * @param data 要更新的用户头像
 * @returns Promise<ApiResponse<User>>
 */
export async function uploadAvatar(data: FormData): Promise<ApiResponse<User>> {
  return put<ApiResponse<User>>(API_ENDPOINTS.AVATAR, data);
}

export async function updatePhone(data: UpdatePhoneRequest): Promise<ApiResponse<User>> {
  return put<ApiResponse<User>>(API_ENDPOINTS.UPDATE_PHONE, data);
}

export async function updateEmail(data: UpdateEmailRequest): Promise<ApiResponse<User>> {
  return put<ApiResponse<User>>(API_ENDPOINTS.UPDATE_EMAIL, data);
}