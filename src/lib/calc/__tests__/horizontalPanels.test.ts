import { describe, it, expect } from 'vitest';
import { computeHorizontalPanelSummary, formatPanelsSummaryString } from '../horizontalPanels';

describe('computeHorizontalPanelSummary', () => {
  it('matches the example 30x20x12 with 3:12 pitch', () => {
    const summary = computeHorizontalPanelSummary({
      lengthFt: 30,
      widthFt: 20,
      legHeightFt: 12,
      panelCoverageFt: 3,
      roofPitchX12: 3,
    });

    // gableRise = (3/12)*(20/2) = 2.5
    expect(summary.gableRiseFt).toBeCloseTo(2.5);
    expect(summary.sideCourses).toBe(4);
    expect(summary.endCourses).toBe(5);
    expect(summary.sidePanelsCount).toBe(8);
    expect(summary.endPanelsCount).toBe(10);
  // After mapping fix: side run = length (30), end run = width (20)
  expect(formatPanelsSummaryString(summary.sidePanelsCount, summary.sideRunFt)).toBe("8 @ 30'");
  expect(formatPanelsSummaryString(summary.endPanelsCount, summary.endRunFt)).toBe("10 @ 20'");
  });

  it('works for flat roof (0 pitch) where endCourses == sideCourses', () => {
    const summary = computeHorizontalPanelSummary({
      lengthFt: 40,
      widthFt: 24,
      legHeightFt: 9,
      panelCoverageFt: 3,
      roofPitchX12: 0,
    });

    expect(summary.gableRiseFt).toBeCloseTo(0);
    expect(summary.sideCourses).toBe(3);
    expect(summary.endCourses).toBe(3);
    expect(summary.sidePanelsCount).toBe(6);
    expect(summary.endPanelsCount).toBe(6);
  });
});
