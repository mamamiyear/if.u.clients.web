// 图片上传相关 API

import { upload } from './request';
import { API_ENDPOINTS } from './config';
import type { ApiResponse } from './types';

/**
 * 上传图片文件
 * @param file 要上传的图片文件
 * @returns Promise<ApiResponse>
 */
export async function postInputImage(file: File): Promise<ApiResponse> {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    throw new Error('只能上传图片文件');
  }
  
  return upload<ApiResponse>(API_ENDPOINTS.INPUT_IMAGE, file, 'image', { timeout: 120000 });
}

/**
 * 上传图片文件（带进度回调）
 * @param file 要上传的图片文件
 * @param onProgress 上传进度回调函数
 * @returns Promise<ApiResponse>
 */
export async function postInputImageWithProgress(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    throw new Error('只能上传图片文件');
  }

  const formData = new FormData();
  // 后端要求字段名为 image
  formData.append('image', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // 监听请求完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          resolve(response);
        } catch {
          resolve({ error_code: 1, error_info: '解析响应失败' });
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    });

    // 监听请求错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'));
    });

    // 监听请求超时
    xhr.addEventListener('timeout', () => {
      reject(new Error('请求超时'));
    });

    // 发送请求
    xhr.open('POST', `http://127.0.0.1:8099${API_ENDPOINTS.INPUT_IMAGE}`);
    xhr.timeout = 120000; // 30秒超时
    xhr.send(formData);
  });
}

/**
 * 验证图片文件
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节），默认 10MB
 * @returns 验证结果
 */
export function validateImageFile(file: File, maxSize = 10 * 1024 * 1024): { valid: boolean; error?: string } {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '只能上传图片文件' };
  }

  // 检查文件大小
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `文件大小不能超过 ${maxSizeMB}MB` };
  }

  // 检查支持的图片格式
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: '支持的图片格式：JPEG、PNG、GIF、WebP' };
  }

  return { valid: true };
}