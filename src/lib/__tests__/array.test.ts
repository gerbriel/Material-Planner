import { describe, it, expect } from 'vitest'
import { reorder } from '../array'

describe('reorder helper', () => {
  it('moves element forward', () => {
    const a = [1,2,3,4]
    expect(reorder(a, 0, 2)).toEqual([2,3,1,4])
  })

  it('moves element backward', () => {
    const a = ['a','b','c','d']
    expect(reorder(a, 2, 0)).toEqual(['c','a','b','d'])
  })
})
