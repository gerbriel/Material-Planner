import { describe, it, expect } from 'vitest'
import { computeWallsAggregate } from '../wallsAggregate'

describe('computeWallsAggregate example', () => {
  it('computes totals with gable extra sheet per end', () => {
    const out = computeWallsAggregate({
      lengthFt: 40,
      widthFt: 30,
      legHeightFt: 12,
      panelCoverageFt: 3,
      roofPitchX12: 3,
    leftSide: 'Horizontal',
  rightSide: 'Horizontal',
  frontEnd: 'Horizontal',
  backEnd: 'Horizontal'
      
    })

    // sideCourses = 4; each side provides 4 -> total 8 @ 40'
    // endCourses = 6; each end provides 6 + 1 extra -> 7 each => total 14 @ 30'
    const agg = out.aggregated
    const byRun = new Map(agg.map(a => [a.runFt, a.qty]))
    expect(byRun.get(40)).toBe(8)
    expect(byRun.get(30)).toBe(14)
  })
})
