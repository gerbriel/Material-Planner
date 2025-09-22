import { describe, it, expect } from 'vitest'
import { deriveSupportsPerSheet, countRoofScrewsByGauge } from '../screws'

describe('screws derivation', () => {
  it('derives supports for heavy/medium/light gauges', () => {
    expect(deriveSupportsPerSheet(14)).toBe(6)
    expect(deriveSupportsPerSheet(20)).toBe(8)
    expect(deriveSupportsPerSheet(26)).toBe(10)
  })

  it('computes roof screws by gauge using derived supports', () => {
    const outHeavy = countRoofScrewsByGauge(10, 14)
    const outLight = countRoofScrewsByGauge(10, 26)
    expect(outHeavy.total).toBe(10 * 6 * 5)
    expect(outLight.total).toBe(10 * 10 * 5)
  })
})
