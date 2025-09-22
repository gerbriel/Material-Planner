import { describe, it, expect } from 'vitest'
import { buildSimpleBom } from '../generator'

describe('buildSimpleBom', () => {
  it('includes framing, roof, trim, hardware categories', () => {
    const job = {
      width: 30,
      length: 50,
      spacing: 5,
      frameGauge: 14,
      panelGauge: 26,
      roofOrientation: 'vertical',
      foundation: 'concrete',
      openings: [{ type: 'walk' }, { type: 'window', widthFt: 6 }],
    }

    const bom = buildSimpleBom(job as any)
    const cats = new Set(bom.map((b: any) => b.category))
    expect(cats.has('Framing')).toBeTruthy()
    expect(cats.has('Roof')).toBeTruthy()
    expect(cats.has('Trim')).toBeTruthy()
    expect(cats.has('Hardware')).toBeTruthy()
    expect(cats.has('Openings')).toBeTruthy()

    const screws = bom.find((b: any) => b.item === 'Roof Screws')
    expect(screws).toBeDefined()
    expect(screws.qty).toBeGreaterThan(0)

    const eave = bom.find((b: any) => b.item === 'Eave')
    expect(eave).toBeDefined()
    expect(eave.qty).toBeGreaterThan(0)
  })
})
