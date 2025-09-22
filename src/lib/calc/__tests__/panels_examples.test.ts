import { describe, it, expect } from 'vitest'
import { computeWallPanels } from '../panels'

describe('computeWallPanels - examples', () => {
  it('30x20x12 horizontal -> per-bay 5ft spacing', () => {
    const span = 20
    const height = 12
    const out = computeWallPanels(span, height, 'horizontal', false, 'full')
    // courses = ceil(12/3) = 4, bays = ceil(20/5) = 4 -> perSideSheets = 16, total = 32
    expect(out.courses).toBe(4)
    expect(out.segments).toBe(4)
    expect(out.perSideSheets).toBe(16)
    expect(out.totalSheets).toBe(32)
    expect(out.perSegmentLen).toBe(5)
  })

  it('30x40x12 horizontal -> per-bay 5ft spacing', () => {
    const span = 40
    const height = 12
    const out = computeWallPanels(span, height, 'horizontal', false, 'full')
    // courses = 4, bays = ceil(40/5) = 8 -> perSideSheets = 32, total = 64
    expect(out.courses).toBe(4)
    expect(out.segments).toBe(8)
    expect(out.perSideSheets).toBe(32)
    expect(out.totalSheets).toBe(64)
    expect(out.perSegmentLen).toBe(5)
  })

  it('end wall includes extra panel (gable) when isEnd true', () => {
    const span = 20
    const height = 12
    const outNoEnd = computeWallPanels(span, height, 'horizontal', false, 'full')
    const outEnd = computeWallPanels(span, height, 'horizontal', true, 'full')
    expect(outEnd.perSideSheets).toBe(outNoEnd.perSideSheets + 1)
  })

  it('width > 30 should work with vertical orientation: columns = ceil(span/3)', () => {
    const span = 32
    const height = 12
    const out = computeWallPanels(span, height, 'vertical', false, 'full')
    expect(out.perSideSheets).toBe(Math.ceil(span / 3))
    expect(out.perPanelLen).toBeGreaterThan(0)
  })

  it('partial mode rounds height up to nearest 3', () => {
    const span = 20
    const height = 10 // rounds up to 12
    const outFull = computeWallPanels(span, height, 'horizontal', false, 'full')
    const outPartial = computeWallPanels(span, height, 'horizontal', false, 'partial')
    expect(outPartial.courses).toBe(Math.ceil(Math.ceil(height / 3) * 3 / 3))
    expect(outPartial.perSideSheets).toBe(outPartial.courses * outPartial.segments)
  })

  it('strips mode respects user-selected strip count (1-7)', () => {
    const span = 20
    const height = 12
    const stripCount = 2
    const out = computeWallPanels(span, height, 'horizontal', false, 'strips', stripCount)
    expect(out.courses).toBe(stripCount)
    expect(out.perSideSheets).toBe(out.courses * out.segments)
  })
})
