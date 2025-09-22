import { describe, it, expect } from 'vitest'
import { bomToCsvRows } from '../bomCsvHelper'

describe('bomToCsvRows', () => {
  const sample = [
    { category: 'Framing', item: 'Truss', qty: 5 },
    { category: 'Roof', item: 'Roof Panel', qty: 20 },
    { category: 'Trim', item: 'Eave', qty: 60 },
  ]

  it('returns all rows when includeCategories empty', () => {
    expect(bomToCsvRows(sample, [])).toHaveLength(3)
  })

  it('filters by category', () => {
    const rows = bomToCsvRows(sample, ['Framing', 'Trim'])
    expect(rows).toHaveLength(2)
    expect(rows.find(r => r.category === 'Roof')).toBeUndefined()
  })
})
