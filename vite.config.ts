import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite 默认支持环境变量，无需额外配置
  // 环境变量加载优先级：
  // .env.local > .env.[mode] > .env
})
