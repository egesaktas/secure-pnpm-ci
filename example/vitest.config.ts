import { cloudflareTest } from '@cloudflare/vitest-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Two test projects:
// - unit:   tests under src/, in a plain Node environment
// - worker: tests under worker/, inside the real Cloudflare runtime (workerd)
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: { name: 'unit', include: ['src/**/*.test.{ts,tsx}'], environment: 'node' },
      },
      {
        plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' } })],
        test: { name: 'worker', include: ['worker/**/*.test.ts'] },
      },
    ],
  },
})
