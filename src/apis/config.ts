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
  INPUT: '/recognition/input',
  INPUT_IMAGE: '/recognition/image',
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
} as const;