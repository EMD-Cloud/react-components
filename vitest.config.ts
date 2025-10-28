import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      '@lib': fileURLToPath(new URL('./dist', import.meta.url)),
      // Allow absolute imports like `import { x } from "src/..."`
      'src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: { 'process.env': process.env },
})
