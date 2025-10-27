// API 配置

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8099',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API 端点
export const API_ENDPOINTS = {
  INPUT: '/input',
  INPUT_IMAGE: '/input_image',
  PEOPLES: '/peoples',
  PEOPLE_BY_ID: (id: string) => `/peoples/${id}`,
} as const;