import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const rootDirectory = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDirectory, 'src'),
    },
  },
  test: {
    coverage: {
      exclude: ['**/*.test.{ts,tsx}', '**/index.ts'],
      include: [
        'src/features/mesa-partes-publica/schemas/**/*.ts',
        'src/features/mesa-partes-publica/utils/**/*.ts',
        'src/utils/**/*.ts',
        'supabase/functions/public-intake/constants.ts',
        'supabase/functions/public-intake/file.utils.ts',
        'supabase/functions/public-intake/payload.utils.ts',
      ],
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: 'jsdom',
    include: ['scripts/**/*.test.mjs', 'src/**/*.test.{ts,tsx}', 'supabase/functions/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
