// API 模块统一导出

// 配置和工具
export * from './config';
export * from './request';
export * from './types';

// 具体接口
export * from './input';
export * from './upload';
export * from './people';
export * from './user';

// 默认导出所有API函数
import * as inputApi from './input';
import * as uploadApi from './upload';
import * as peopleApi from './people';
import * as userApi from './user';

export const api = {
  // 文本输入相关
  input: inputApi,
  
  // 图片上传相关
  upload: uploadApi,
  
  // 人员管理相关
  people: peopleApi,
  
  // 用户管理相关
  user: userApi,
};

export default api;