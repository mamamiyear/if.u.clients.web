/**
 * 静态资源缓存工具
 * 用于缓存图片等静态资源，避免重复请求
 * 支持 内存缓存 + LocalStorage 持久化缓存
 * 采用 LRU (Least Recently Used) 算法淘汰旧缓存，上限 500 条
 */

const CACHE_PREFIX = 'static_resource_';
const LRU_INDEX_KEY = 'static_resource_lru_index';
const DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 默认7天过期
const MAX_CACHE_ITEMS = 500; // 最大缓存条数

interface CacheEntry {
  data: string; // Base64 Data URL
  timestamp: number;
}

// 内存缓存：URL -> Promise<Data URL>
// 作为一级缓存，减少 LocalStorage 读取频率，并处理并发请求
const memoryCache = new Map<string, Promise<string>>();

// LRU 索引列表（内存副本），存储 URL 字符串
// 顺序：[最久未使用, ..., 最近使用]
let lruList: string[] = [];

// 初始化：从 LocalStorage 加载 LRU 索引
try {
  const storedIndex = localStorage.getItem(LRU_INDEX_KEY);
  if (storedIndex) {
    lruList = JSON.parse(storedIndex);
  }
} catch (e) {
  console.warn('[ResourceCache] Failed to load LRU index', e);
  lruList = [];
}

/**
 * 更新 LRU 列表
 * 将指定 URL 移动到列表末尾（表示最近使用）
 * 并持久化到 LocalStorage
 */
function updateLru(url: string) {
  // 1. 如果已存在，先移除
  const index = lruList.indexOf(url);
  if (index !== -1) {
    lruList.splice(index, 1);
  }
  
  // 2. 添加到末尾
  lruList.push(url);
  
  // 3. 保存到 LocalStorage
  try {
    localStorage.setItem(LRU_INDEX_KEY, JSON.stringify(lruList));
  } catch (e) {
    console.warn('[ResourceCache] Failed to save LRU index', e);
  }
}

/**
 * 检查并执行 LRU 淘汰
 * 如果列表超过最大限制，移除头部元素（最久未使用）及其对应的缓存数据
 */
function pruneCache() {
  let changed = false;
  
  while (lruList.length > MAX_CACHE_ITEMS) {
    const urlToRemove = lruList.shift(); // 移除头部（最老）
    if (urlToRemove) {
      const cacheKey = CACHE_PREFIX + urlToRemove;
      localStorage.removeItem(cacheKey);
      memoryCache.delete(urlToRemove); // 同时清理内存缓存
      changed = true;
    }
  }

  if (changed) {
    try {
      localStorage.setItem(LRU_INDEX_KEY, JSON.stringify(lruList));
    } catch (e) {
      console.warn('[ResourceCache] Failed to save LRU index after pruning', e);
    }
  }
}

/**
 * 从 LRU 列表中移除指定 URL
 */
function removeFromLru(url: string) {
  const index = lruList.indexOf(url);
  if (index !== -1) {
    lruList.splice(index, 1);
    try {
      localStorage.setItem(LRU_INDEX_KEY, JSON.stringify(lruList));
    } catch (e) {
      console.warn('[ResourceCache] Failed to save LRU index after removal', e);
    }
  }
}

/**
 * 获取缓存的静态资源 URL
 * @param url 原始资源 URL
 * @returns Promise<string> 返回 Base64 Data URL 或原始 URL（如果请求失败）
 */
export async function getCachedResource(url: string): Promise<string> {
  if (!url) return '';

  // 1. 检查一级内存缓存
  if (memoryCache.has(url)) {
    // 命中内存缓存，也视为一次访问，更新 LRU
    updateLru(url);
    return memoryCache.get(url)!;
  }

  // 2. 检查二级 LocalStorage 缓存
  const cacheKey = CACHE_PREFIX + url;
  const storedItem = localStorage.getItem(cacheKey);

  if (storedItem) {
    try {
      const entry: CacheEntry = JSON.parse(storedItem);
      const now = Date.now();
      
      // 检查是否过期
      if (now - entry.timestamp < DEFAULT_EXPIRY) {
        // 缓存有效
        // 更新 LRU 状态
        updateLru(url);
        
        // 存入内存缓存并返回
        const promise = Promise.resolve(entry.data);
        memoryCache.set(url, promise);
        return promise;
      } else {
        // 缓存过期，清理
        localStorage.removeItem(cacheKey);
        removeFromLru(url);
      }
    } catch (e) {
      console.warn(`[ResourceCache] Failed to parse cache for ${url}`, e);
      localStorage.removeItem(cacheKey);
      removeFromLru(url);
    }
  }

  // 3. 缓存未命中，发起网络请求
  const requestPromise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load resource: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // 将 Blob 转换为 Base64 Data URL 以便存储到 LocalStorage
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          
          // 尝试存入 LocalStorage
          try {
            // 先更新 LRU 并执行淘汰，腾出空间
            updateLru(url);
            pruneCache();
            
            const entry: CacheEntry = {
              data: base64data,
              timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(entry));
          } catch (e) {
            console.warn(`[ResourceCache] LocalStorage full or error, skipping cache for ${url}`, e);
            // 写入失败（可能是 QuotaExceeded），回滚 LRU 变更
            removeFromLru(url);
            // 这里不抛出错误，仅仅是无法持久化缓存，依然返回数据
          }
          
          resolve(base64data);
        };
        reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.warn(`[ResourceCache] Failed to fetch resource: ${url}`, error);
      // 请求失败，从内存缓存中移除 Promise，以便下次重试
      memoryCache.delete(url);
      // 降级返回原始 URL
      return url;
    }
  })();

  // 存入内存缓存，处理并发
  memoryCache.set(url, requestPromise);

  return requestPromise;
}

/**
 * 清除指定资源的缓存（包括内存和 LocalStorage）
 * @param url 资源 URL
 */
export function clearResourceCache(url: string) {
  // 清理内存
  if (memoryCache.has(url)) {
    memoryCache.delete(url);
  }
  
  // 清理 LocalStorage
  const cacheKey = CACHE_PREFIX + url;
  localStorage.removeItem(cacheKey);
  
  // 清理 LRU 索引
  removeFromLru(url);
}

/**
 * 清理所有过期的静态资源缓存
 * (同时也修正 LRU 索引与实际缓存的一致性)
 */
export function clearExpiredCache() {
  const now = Date.now();
  
  // 遍历所有 LocalStorage key
  // 注意：这里我们反向遍历或复制 key 列表，因为会在循环中删除 item
  const keysToRemove: string[] = [];
  const urlsToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const entry: CacheEntry = JSON.parse(item);
          if (now - entry.timestamp >= DEFAULT_EXPIRY) {
            keysToRemove.push(key);
            urlsToRemove.push(key.replace(CACHE_PREFIX, ''));
          }
        }
      } catch {
        // 格式错误等情况，直接清理
        keysToRemove.push(key);
      }
    }
  }
  
  // 批量执行清理
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // 从 LRU 列表中批量移除
  if (urlsToRemove.length > 0) {
    lruList = lruList.filter(url => !urlsToRemove.includes(url));
    try {
      localStorage.setItem(LRU_INDEX_KEY, JSON.stringify(lruList));
    } catch (e) {
      console.warn('[ResourceCache] Failed to save LRU index after cleanup', e);
    }
  }
}
