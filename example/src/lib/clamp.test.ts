import { describe, expect, it } from 'vitest'
import { clamp } from './clamp'

describe('clamp', () => {
  it('keeps a value that is already in range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to the lower and upper bounds', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
    expect(clamp(42, 0, 10)).toBe(10)
  })

  it('throws when min is greater than max', () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError)
  })
})
