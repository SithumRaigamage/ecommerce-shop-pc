/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Only the framework is pinned to a chunk: it is on every route and changes
 * rarely, so it deserves its own long-lived cache entry. Everything else is
 * left to Rollup, which keeps route-specific dependencies (the forms stack, the
 * select primitive) inside the lazy route chunks that actually need them.
 */
const REACT_PACKAGES = ['react', 'react-dom', 'scheduler', 'react-router', 'react-router-dom']

function chunkFor(id: string): string | undefined {
  const match = /node_modules\/(?:\.pnpm\/)?((?:@[^/]+\/)?[^/]+)/.exec(id)
  if (!match) return undefined
  const pkg = match[1]

  return REACT_PACKAGES.includes(pkg) ? 'vendor-react' : undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => chunkFor(id),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['e2e/**', 'src/components/ui/**', '**/*.config.*', 'src/main.tsx'],
    },
  },
})
