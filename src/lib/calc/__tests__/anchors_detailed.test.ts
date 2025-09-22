import { describe, it, expect } from 'vitest'
import { countAnchorsDetailed } from '../anchors'

describe('anchors detailed', () => {
  it('returns none for zero legs', () => {
    expect(countAnchorsDetailed(0, 'bare')).toEqual({ type: 'none', qty: 0, perLeg: 0 })
  })

  it('bare small building uses 2 rebar per leg', () => {
    expect(countAnchorsDetailed(6, 'bare', 24, 20)).toEqual({ type: 'rebar', qty: 12, perLeg: 2 })
  })

  it('bare heavy or wide uses 4 rebar per leg', () => {
    expect(countAnchorsDetailed(8, 'bare', 16, 30)).toEqual({ type: 'rebar', qty: 32, perLeg: 4 })
  })

  it('concrete uses 4 wedge anchors per leg', () => {
    expect(countAnchorsDetailed(5, 'concrete')).toEqual({ type: 'wedge', qty: 20, perLeg: 4 })
  })

  it('asphalt uses kits grouped by 10 legs', () => {
    expect(countAnchorsDetailed(25, 'asphalt')).toEqual({ type: 'asphalt_kit', qty: Math.ceil(25 / 10), perLeg: 0 })
  })
})
