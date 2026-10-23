import { exports } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'

// These tests run inside the real Cloudflare runtime (workerd).
describe('worker', () => {
  it('returns ok from /api/health', async () => {
    const res = await exports.default.fetch('https://example.dev/api/health')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('returns 404 for an unknown path', async () => {
    const res = await exports.default.fetch('https://example.dev/api/missing')

    expect(res.status).toBe(404)
  })
})
