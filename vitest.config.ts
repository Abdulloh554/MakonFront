import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['services/api.ts', 'services/admin.ts', 'store/auth.store.ts', 'store/property.store.ts', 'store/ui.store.ts', 'queries/property.queries.ts', 'components/ui/Button.tsx', 'components/ui/LoadingSpinner.tsx', 'components/ui/Toast.tsx', 'components/ui/ToastProvider.tsx', 'components/features/properties/PropertyCard.tsx'],
      exclude: ['store/index.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
})
