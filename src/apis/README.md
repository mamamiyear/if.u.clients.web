# API 接口封装

本目录包含了对 FastAPI 后端接口的完整封装，提供了类型安全的 TypeScript 接口。

## 文件结构

```
src/apis/
├── index.ts          # 统一导出文件
├── config.ts         # API 配置
├── request.ts        # 基础请求工具
├── types.ts          # TypeScript 类型定义
├── input.ts          # 文本输入接口
├── upload.ts         # 图片上传接口
├── people.ts         # 人员管理接口
└── README.md         # 使用说明
```

## 使用方法

### 1. 导入方式

```typescript
// 方式一：导入所有API
import api from '@/apis';

// 方式二：按需导入
import { postInput, getPeoples, postInputImage } from '@/apis';

// 方式三：分模块导入
import { api } from '@/apis';
const { input, people, upload } = api;
```

### 2. 文本输入接口

```typescript
import { postInput } from '@/apis';

// 提交文本
try {
  const response = await postInput('这是一段文本');
  console.log('提交成功:', response);
} catch (error) {
  console.error('提交失败:', error);
}
```

### 3. 图片上传接口

```typescript
import { postInputImage, validateImageFile } from '@/apis';

// 上传图片
const handleFileUpload = async (file: File) => {
  // 验证文件
  const validation = validateImageFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  try {
    const response = await postInputImage(file);
    console.log('上传成功:', response);
  } catch (error) {
    console.error('上传失败:', error);
  }
};

// 带进度的上传
import { postInputImageWithProgress } from '@/apis';

const handleFileUploadWithProgress = async (file: File) => {
  try {
    const response = await postInputImageWithProgress(file, (progress) => {
      console.log(`上传进度: ${progress}%`);
    });
    console.log('上传成功:', response);
  } catch (error) {
    console.error('上传失败:', error);
  }
};
```

### 4. 人员管理接口

```typescript
import { 
  createPeople, 
  getPeoples, 
  searchPeoples, 
  deletePeople,
  updatePeople,
  getPeoplesPaginated 
} from '@/apis';

// 创建人员
const createNewPeople = async () => {
  const peopleData = {
    name: '张三',
    gender: '男',
    age: 25,
    height: 175,
    marital_status: '未婚'
  };

  try {
    const response = await createPeople(peopleData);
    console.log('创建成功:', response);
  } catch (error) {
    console.error('创建失败:', error);
  }
};

// 查询人员列表
const fetchPeoples = async () => {
  try {
    const response = await getPeoples({
      limit: 20,
      offset: 0
    });
    console.log('查询结果:', response.data);
  } catch (error) {
    console.error('查询失败:', error);
  }
};

// 搜索人员
const searchForPeople = async (keyword: string) => {
  try {
    const response = await searchPeoples(keyword, 10);
    console.log('搜索结果:', response.data);
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

// 分页查询
const fetchPeoplesPaginated = async (page: number) => {
  try {
    const response = await getPeoplesPaginated(page, 10);
    console.log('分页结果:', response.data);
  } catch (error) {
    console.error('查询失败:', error);
  }
};

// 删除人员
const removePeople = async (peopleId: string) => {
  try {
    const response = await deletePeople(peopleId);
    console.log('删除成功:', response);
  } catch (error) {
    console.error('删除失败:', error);
  }
};

// 更新人员
const updateOnePeople = async (peopleId: string) => {
  const peopleData = {
    name: '李四',
    age: 28,
  };
  try {
    const response = await updatePeople(peopleId, peopleData);
    console.log('更新成功:', response);
  } catch (error) {
    console.error('更新失败:', error);
  }
};
```

## 错误处理

所有接口都会抛出 `ApiError` 类型的错误，包含以下信息：

```typescript
try {
  const response = await postInput('test');
} catch (error) {
  if (error instanceof ApiError) {
    console.log('错误状态码:', error.status);
    console.log('错误信息:', error.message);
    console.log('错误详情:', error.data);
  }
}
```

## 类型定义

所有接口都提供了完整的 TypeScript 类型支持：

```typescript
import type { 
  People, 
  GetPeoplesParams, 
  PostInputRequest,
  ApiResponse 
} from '@/apis';
```

## 配置

可以通过修改 `config.ts` 文件来调整 API 配置：

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8099',  // API 基础地址
  TIMEOUT: 10000,                      // 请求超时时间
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
```