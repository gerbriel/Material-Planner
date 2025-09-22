import { describe, it, expect } from 'vitest'
import { computeTrimLF, headerSealsForRollups } from '../trims'

describe('trims', () => {
  it('computes linear feet and 11ft sticks', () => {
    const { lf, sticks } = computeTrimLF(120, 5)
    expect(lf).toBe(125)
    expect(sticks).toBe(Math.ceil(125 / 11))
  })

  it('header seals equals rollup count', () => {
    expect(headerSealsForRollups(3)).toBe(3)
  })
})
