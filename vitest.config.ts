import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      clean: true,
      include: [
        'src/hooks/**/*.{ts,tsx}',
        'src/components/**/*.{ts,tsx}',
        'src/tools/**/*.{ts,tsx}',
        'src/index.ts'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'out-tsc/**',
        'tests/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/stories/**',
        '**/*.stories.{ts,tsx}',
        '**/*.d.ts',
        'src/hooks/index.ts',
        'src/components/index.ts',
        '*.config.{ts,js}',
        'tests/config.ts'
      ],
      reporter: [
        'text',         // Console output
        'text-summary', // Brief summary in console
        'html',         // Interactive HTML report
        'json',         // JSON for CI/CD integration
        'lcov'          // LCOV for external tools (SonarQube, Codecov, etc.)
      ],
      reportsDirectory: './coverage',
      // Coverage thresholds (set to current baseline - improve over time)
      thresholds: {
        lines: 75,
        branches: 64,
        functions: 79,
        statements: 74
      },
      skipFull: false
    }
  },
  resolve: {
    alias: {
      '@lib': fileURLToPath(new URL('./dist', import.meta.url)),
      'src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: { 'process.env': process.env },
})
