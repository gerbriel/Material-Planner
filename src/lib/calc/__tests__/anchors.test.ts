import { describe, it, expect } from 'vitest'
import { countAnchors } from '../anchors'

describe('anchors', () => {
  it('returns rebar for bare foundation', () => {
    expect(countAnchors(4, 'bare')).toEqual({ type: 'rebar', qty: 4 })
  })

  it('returns wedge anchors for concrete with qty*4', () => {
    expect(countAnchors(6, 'concrete')).toEqual({ type: 'wedge', qty: 24 })
  })

  it('returns asphalt sets grouped by 10 legs', () => {
    expect(countAnchors(25, 'asphalt')).toEqual({ type: 'asphalt_sets', qty: Math.ceil(25 / 10) })
  })
})
