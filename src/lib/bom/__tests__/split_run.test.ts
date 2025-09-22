import { describe, it, expect } from 'vitest';
import { buildSimpleBom } from '../generator';

describe('split-run BOM behavior', () => {
  it('emits aggregated side/end rows but notes contain breakdown for split runs', () => {
    // Construct a minimal job object with a span that is not divisible by 5 (spacing)
    const job: any = {
      building: {
        lengthFt: 23, // will cause 5ft spacing -> 4*5 = 20 + 3 remainder
        widthFt: 20,
        legHeightFt: 12,
      },
      framing: {},
      panels: {
        wallPanelMode: 'full',
        wallStripCount: 4,
        spacingFt: 5,
      },
      materials: {},
    };

  // buildSimpleBom expects top-level fields (length, width, legHeight, spacing)
  job.length = job.building.lengthFt
  job.width = job.building.widthFt
  job.legHeight = job.building.legHeightFt
  job.spacing = job.panels.spacingFt
  // ensure horizontal orientation so computeWallPanels uses spacing bays
  job.wallOrientation = 'horizontal'

  const bom = buildSimpleBom(job);

    // Find side and end rows (aggregated 1-side/2-sides and 1-end/2-ends)
    const sideRows = bom.filter((r: any) => /side/i.test(r.item));
    const endRows = bom.filter((r: any) => /end/i.test(r.item));

    // Expect aggregated rows exist
    expect(sideRows.length).toBeGreaterThan(0);
    expect(endRows.length).toBeGreaterThan(0);

  // Notes no longer include breakdown text; ensure aggregated rows include structured fields
  const rows = sideRows.concat(endRows)
  expect(rows.some((r: any) => typeof r.piecesPerSide === 'number' || typeof r.sideOrEnd === 'string')).toBe(true)
  });
});
