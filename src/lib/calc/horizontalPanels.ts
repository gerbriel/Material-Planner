// Utility to compute horizontal panel summaries for side and end walls.
export type HorizontalPanelSummary = {
  sidePanelsCount: number; // total panels for both sides
  sideRunFt: number; // run length for side panels (width)
  endPanelsCount: number; // total panels for both ends
  endRunFt: number; // run length for end panels (length)
  gableRiseFt: number;
  sideCourses: number;
  endCourses: number;
};

/**
 * Compute horizontal panels summary according to the spec.
 * side walls use legHeight only; end walls include gable rise.
 */
export function computeHorizontalPanelSummary(opts: {
  lengthFt: number;
  widthFt: number;
  legHeightFt: number;
  panelCoverageFt?: number; // default 3
  roofPitchX12?: number; // e.g., 3 for 3:12
}): HorizontalPanelSummary {
  const { lengthFt, widthFt, legHeightFt } = opts;
  const panelCoverageFt = opts.panelCoverageFt ?? 3;
  const roofPitchX12 = opts.roofPitchX12 ?? 0;

  // gable rise is based on the building width (end-wall span)
  const gableRiseFt = (roofPitchX12 / 12) * (widthFt / 2);

  const sideCourses = Math.ceil(legHeightFt / panelCoverageFt);
  const endCourses = Math.ceil((legHeightFt + gableRiseFt) / panelCoverageFt);

  const sidePanelsCount = 2 * sideCourses;
  const endPanelsCount = 2 * endCourses;

  return {
    sidePanelsCount,
    // side walls run along the building length
    sideRunFt: lengthFt,
    endPanelsCount,
    // end walls span the building width
    endRunFt: widthFt,
    gableRiseFt,
    sideCourses,
    endCourses,
  };
}

export function formatPanelsSummaryString(count: number, runFt: number): string {
  // Format like "8 @ 20'"
  return `${count} @ ${runFt}'`;
}
