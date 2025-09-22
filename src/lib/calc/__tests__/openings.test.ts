import { describe, it, expect } from 'vitest'
import { bracketCounts } from '../openings'

describe('openings', () => {
  it('calculates bracket counts for mixed openings', () => {
    const input = [
      { type: 'walk' },
      { type: 'window' },
      { type: 'rollup', side: 'side' },
      { type: 'rollup', side: 'end' },
    ]

    const out = bracketCounts(input as any)
    expect(out.walk).toBe(8)
    expect(out.window).toBe(14)
    expect(out.rollupSide).toBe(4)
    expect(out.rollupEnd).toBe(4)
  })
})
