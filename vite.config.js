import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@lib': fileURLToPath(new URL('./dist', import.meta.url)),
    },
  },
})
