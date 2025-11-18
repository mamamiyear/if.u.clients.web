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
  PEOPLE_REMARK_BY_ID: (id: string) => `/people/${id}/remark`,
  // 用户相关
  SEND_CODE: '/user/send_code',
  REGISTER: '/user/register',
  LOGIN: '/user/login',
  LOGOUT: '/user/logout',
  ME: '/user/me',
  AVATAR: '/user/me/avatar',
  DELETE_USER: '/user',
  UPDATE_PHONE: '/user/phone',
  UPDATE_EMAIL: '/user/email',
} as const;