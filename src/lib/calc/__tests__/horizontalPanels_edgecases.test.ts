import { describe, it, expect } from 'vitest'
import { computeHorizontalPanelSummary, formatPanelsSummaryString } from '../horizontalPanels'

describe('computeHorizontalPanelSummary edge cases', () => {
  it('handles very tall walls (e.g., 50 ft) by computing many courses', () => {
    const summary = computeHorizontalPanelSummary({ lengthFt: 40, widthFt: 20, legHeightFt: 50, panelCoverageFt: 3, roofPitchX12: 2 })
    // 50 / 3 = 16.666 -> ceil = 17 courses
    expect(summary.sideCourses).toBe(17)
    expect(summary.sidePanelsCount).toBe(34)
  })

  it('handles odd roof pitches producing fractional gable rise', () => {
    const summary = computeHorizontalPanelSummary({ lengthFt: 30, widthFt: 25, legHeightFt: 12, panelCoverageFt: 3, roofPitchX12: 7 })
    // gableRise = (7/12)*(25/2) = (7/12)*12.5 = 7.29166...
    expect(summary.gableRiseFt).toBeCloseTo((7 / 12) * (25 / 2), 6)
    // endCourses should be ceiling((12 + gableRise)/3)
    const expectedEndCourses = Math.ceil((12 + summary.gableRiseFt) / 3)
    expect(summary.endCourses).toBe(expectedEndCourses)
  })
})
