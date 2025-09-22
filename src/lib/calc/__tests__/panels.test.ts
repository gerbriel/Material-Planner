import { describe, it, expect } from 'vitest'
import { roofPanelSheets, wallPanelSheets } from '../panels'

describe('panels', () => {
  it('computes roof panels', () => {
    const r = roofPanelSheets(30, 50, 'vertical')
    expect(r.totalSheets).toBeGreaterThan(0)
    expect(typeof r.panelLen).toBe('number')
  })

  it('computes wall panels', () => {
    const w = wallPanelSheets(9, 'vertical')
    expect(w.totalSheets).toBeGreaterThanOrEqual(1)
  })
})
