import { describe, it, expect } from 'vitest'
import { computeTrussCount, computeLegCount, estimateBraces } from '../framing'

describe('framing', () => {
  it('computes truss and leg counts', () => {
    const trusses = computeTrussCount(50, 5)
    expect(trusses).toBe(11)
    expect(computeLegCount(trusses)).toBe(22)
  })

  it('estimates braces', () => {
    const braces = estimateBraces(40, 50, 12)
    expect(braces).toBeGreaterThan(0)
  })
})
