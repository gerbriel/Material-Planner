import { describe, it, expect } from 'vitest'
import { computeOpeningReinforcement } from '../openings'

describe('opening reinforcement', () => {
  it('handles walk, window and rollup (end/side)', () => {
    const input = [
      { type: 'walk' },
      { type: 'window', widthFt: 6 },
      { type: 'rollup', widthFt: 12, side: 'end' },
    ] as any

    const out = computeOpeningReinforcement(input as any, 30)
    // walk: header 4, window: 6+1=7, rollup:12+2=14 => total 25
    expect(out.headerLF).toBe(25)
    // lBrackets: walk 4 + window 6 + rollup end 8 = 18
    expect(out.lBrackets).toBe(18)
    // blocking: 2 + 1 + 3 = 6
    expect(out.blocking).toBe(6)
  })

  it('uses building width for rollup default width', () => {
    const input = [{ type: 'rollup' }] as any
    const out = computeOpeningReinforcement(input as any, 24)
    // default width min(12, buildingWidth) -> 12 so header = 14
    expect(out.headerLF).toBe(14)
  })
})
