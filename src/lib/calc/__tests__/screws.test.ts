import { describe, it, expect } from 'vitest'
import { countRoofScrews, countTrimScrews } from '../screws'

describe('screws', () => {
  it('counts roof screws and bags', () => {
    const { total, bags } = countRoofScrews(20, 8)
    expect(total).toBe(20 * 8 * 5)
    expect(bags).toBe(Math.ceil((20 * 8 * 5) / 250))
  })

  it('counts trim screws and bags', () => {
    const { total, bags } = countTrimScrews(200, 0.5)
    const contacts = 200 * 0.5
    expect(total).toBe(Math.ceil(contacts * 3))
    expect(bags).toBe(Math.ceil(Math.ceil(contacts * 3) / 250))
  })
})
