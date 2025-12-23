// API 配置

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API 端点
export const API_ENDPOINTS = {
  RECOGNITION_INPUT: (model: 'people' | 'custom') => `/recognition/${model}/input`,
  RECOGNITION_IMAGE: (model: 'people' | 'custom') => `/recognition/${model}/image`,
  // 人员列表查询仍为 /peoples
  PEOPLES: '/peoples',
  // 新增单个资源路径 /people
  PEOPLE: '/people',
  PEOPLE_BY_ID: (id: string) => `/people/${id}`,
  PEOPLE_IMAGE_BY_ID: (id: string) => `/people/${id}/image`,
  PEOPLE_REMARK_BY_ID: (id: string) => `/people/${id}/remark`,
  UPLOAD_IMAGE: '/upload/image',
  // 用户相关
  SEND_CODE: '/user/send_code',
  REGISTER: '/user',
  LOGIN: '/user/login',
  LOGOUT: '/user/me/login',
  ME: '/user/me',
  AVATAR: '/user/me/avatar',
  DELETE_USER: '/user/me',
  UPDATE_PHONE: '/user/me/phone',
  UPDATE_EMAIL: '/user/me/email',
  // 客户相关
  CUSTOM: '/custom', // 假设的端点
  CUSTOMS: '/customs', // 假设的端点
  CUSTOM_IMAGE_BY_ID: (id: string) => `/custom/${id}/image`,
  CUSTOM_COMMENT_BY_ID: (id: string) => `/custom/${id}/comment`,
  CUSTOM_COMMENTS_BY_ID: (id: string) => `/custom/${id}/comments`,
  CUSTOM_COMMENT_UPDATE_DELETE: (customId: string, commentId: string) => `/custom/${customId}/comment/${commentId}`,
  USER_BY_ID: (id: string) => `/user/${id}`,
} as const;
