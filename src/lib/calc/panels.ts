/**
 * Panels calculations
 */

/**
 * Roof panel sheets for vertical orientation (3' wide sheets)
 * panelLen = width / 2 + 1.25 (1'3" = 1.25ft)
 * Sheets are 3' wide; max sheet length 31'
 */
/**
 * panels.ts - basic panel sheet calculations
 */

export function roofPanelSheets(widthFt: number, lengthFt: number, orientation: 'vertical' | 'horizontal') {
  // As requested: roof sheet qty = ceil((lengthFt + 1) / 3) * 2
  // panel length = (widthFt / 2) + 1.25 (1'3")
  const moduleWidth = 3
  const qty = Math.ceil((lengthFt + 1) / moduleWidth) * 2
  const panelLen = (widthFt / 2) + 1.25
  const exceeds = panelLen > 31
  return { totalSheets: qty, panelLen, exceeds }
}

export function wallPanelSheets(sideHeightFt: number, wallOrientation: 'vertical' | 'horizontal' | 'open') {
  if (wallOrientation === 'open') return { totalSheets: 0 }
  const strips = Math.ceil(sideHeightFt / 3)
  return { totalSheets: strips }
}

/**
 * Compute wall panels for a given wall span and wall height.
 * - moduleWidth: 3' panels
 * - max panel length: 31'
 * Behavior:
 * - horizontal orientation => panels run across the span; you stack courses to reach the wall height.
 *   each course may be split into multiple overlapping panels if the span exceeds max length.
 * - vertical orientation => panels run top-to-bottom, so you cover the span with columns of 3' width.
 */
export function computeWallPanels(
  spanFt: number,
  heightFt: number,
  orientation: 'vertical' | 'horizontal' | 'open',
  isEnd = false,
  mode: 'full' | 'wainscot' | 'strips' | 'partial' = 'full',
  stripCount?: number,
  spacingFt: number = 5
) {
  const moduleWidth = 3
  const maxLen = 31
  if (orientation === 'open') return { totalSheetsPerSide: 0, perSegmentLen: 0, courses: 0, segments: 0, perSideSheets: 0, totalSheets: 0 }

  // partial mode: ensure coverage height is divisible by 3 (round up)
  const usedHeight = mode === 'partial' ? Math.ceil(heightFt / moduleWidth) * moduleWidth : heightFt

  if (orientation === 'horizontal') {
    // Determine courses (stacked courses to reach height). If 'strips' mode is used, use stripCount (bounded 1-7)
    let courses = Math.ceil(usedHeight / moduleWidth)
    if (mode === 'strips' && stripCount && stripCount >= 1 && stripCount <= 7) {
      courses = Math.ceil(stripCount)
    }

    // bays across span at spacingFt
    const floorBays = Math.floor(spanFt / spacingFt)
    const remainder = spanFt - floorBays * spacingFt
    const bays = remainder > 0 ? floorBays + 1 : floorBays

    // generic values used by older callers/tests
    const segments = bays
    const perSegmentLen = spacingFt
    let perSideSheets = courses * bays
    if (isEnd) perSideSheets += 1
    const totalSheets = perSideSheets * 2

    if (remainder === 0) {
      // simple case: all bays equal spacingFt
      return { courses, segments, perSegmentLen, spacingFt, remainder: 0, perSideSheets, totalSheets, pieceLengths: [{ len: spacingFt, piecesPerSide: courses * bays }] }
    }

    // split into full spacing bays (bays-1) and a remainder bay
    const perSidePiecesFull = courses * (bays - 1)
    const perSidePiecesRem = courses
    // total sheets across both piece types (per side sheets already uses courses*bays + isEnd above)
    return {
      courses,
      segments,
      perSegmentLen,
      spacingFt,
      remainder,
      perSidePiecesFull,
      perSidePiecesRem,
      perSideSheets,
      totalSheets,
      pieceLengths: [
        { len: spacingFt, piecesPerSide: perSidePiecesFull },
        { len: remainder, piecesPerSide: perSidePiecesRem }
      ]
    }
  }

  // vertical orientation: panels run top-to-bottom; each column is moduleWidth wide
  const columns = Math.ceil(spanFt / moduleWidth)
  // panel length is the wall height; add 1.25' edge allowance similar to roof
  const perPanelLen = usedHeight + 1.25
  const perSideSheets = columns
  const exceeds = perPanelLen > maxLen
  return { totalSheetsPerSide: perSideSheets, perPanelLen, courses: 1, segments: columns, perSideSheets, totalSheets: perSideSheets * 2, exceeds }
}
