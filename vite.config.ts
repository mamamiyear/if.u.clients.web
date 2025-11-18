import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const keyPath = env.VITE_HTTPS_KEY_PATH
  const certPath = env.VITE_HTTPS_CERT_PATH

  return {
    plugins: [react()],
    // Vite 默认支持环境变量，无需额外配置
    // 环境变量加载优先级：
    // .env.local > .env.[mode] > .env
    server: {
      https: keyPath && certPath
        ? {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          }
        : undefined,
      host: 'localhost',
      proxy: {
        '/api': {
          target: 'http://localhost:8099',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
