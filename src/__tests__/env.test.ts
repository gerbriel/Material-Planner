import { describe, it, expect } from 'vitest'

describe('env check', () => {
  it('has document and localStorage', () => {
    expect(typeof document).toBe('object')
    expect(typeof localStorage).toBe('object')
  })
})
