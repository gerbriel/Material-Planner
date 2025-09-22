import { describe, it, expect } from 'vitest'
import { breakdownTrims } from '../trims'

describe('trims breakdown', () => {
  it('computes total LF and optimizes 11ft sticks', () => {
    const lengths = {
      eave: 50,
      rake: 30,
      gable: 20,
      corner: 4,
    }

    const out = breakdownTrims(lengths)
    expect(out.totalLF).toBe(104)
    // totalLF 104 / 11 = 9.45, so sticks should be between 10 and 12 depending on packing; expect <= 12
    expect(out.sticks).toBeLessThanOrEqual(12)
    expect(out.sticks).toBeGreaterThanOrEqual(10)
    expect(Array.isArray(out.sticksDetail)).toBeTruthy()
  })
})
