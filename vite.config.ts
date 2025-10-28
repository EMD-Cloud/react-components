import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import process from 'process'

import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lib': fileURLToPath(new URL('./dist', import.meta.url)),
      // Allow absolute imports like `import { x } from "src/..."`
      'src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: { 'process.env': process.env },
})
