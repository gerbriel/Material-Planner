import { computeHorizontalPanelSummary } from './horizontalPanels'
import { computeWallPanels } from './panels'

export type WallSelection = 'Open' | 'Vertical' | 'Horizontal'

export type WallAggregateRow = {
  label: string
  qty: number
  runFt: number
  contributors?: string[]
}

export function computeWallsAggregate(opts: {
  lengthFt: number
  widthFt: number
  legHeightFt: number
  panelCoverageFt?: number
  roofPitchX12?: number
  leftSide?: WallSelection
  rightSide?: WallSelection
  frontEnd?: WallSelection
  backEnd?: WallSelection
  leftSideCourses?: number
  rightSideCourses?: number
  frontEndCourses?: number
  backEndCourses?: number
}) {
  const { lengthFt, widthFt, legHeightFt } = opts
  const panelCoverageFt = opts.panelCoverageFt ?? 3
  const roofPitchX12 = opts.roofPitchX12 ?? 0

  const horizontalSummary = computeHorizontalPanelSummary({ lengthFt, widthFt, legHeightFt, panelCoverageFt, roofPitchX12 })

  const rows: WallAggregateRow[] = []

  // helper to add horizontal wall rows
  function addHorizontal(label: string, courses: number, runFt: number, extra: number = 0) {
    const qty = courses + extra
    rows.push({ label, qty, runFt })
  }

  const sideCourses = horizontalSummary.sideCourses
  const endCourses = horizontalSummary.endCourses

  // helper to resolve selected courses (default to full if undefined)
  function resolveSideCourses(selected?: number) {
    return typeof selected === 'number' ? Math.max(1, Math.min(sideCourses, Math.floor(selected))) : sideCourses
  }

  function resolveEndCourses(selected?: number) {
    return typeof selected === 'number' ? Math.max(1, Math.min(endCourses, Math.floor(selected))) : endCourses
  }

  // Left side
  if (opts.leftSide === 'Horizontal') {
    const courses = resolveSideCourses(opts.leftSideCourses)
    rows.push({ label: 'Left Side', qty: courses, runFt: lengthFt, contributors: ['left'] })
  } else if (opts.leftSide === 'Vertical') {
    const v = computeWallPanels(lengthFt, legHeightFt, 'vertical', false, 'full')
    rows.push({ label: 'Left Side (V)', qty: v.perSideSheets || v.totalSheetsPerSide || 0, runFt: v.perPanelLen || lengthFt, contributors: ['left'] })
  }

  // Right side
  if (opts.rightSide === 'Horizontal') {
    const courses = resolveSideCourses(opts.rightSideCourses)
    rows.push({ label: 'Right Side', qty: courses, runFt: lengthFt, contributors: ['right'] })
  } else if (opts.rightSide === 'Vertical') {
    const v = computeWallPanels(lengthFt, legHeightFt, 'vertical', false, 'full')
    rows.push({ label: 'Right Side (V)', qty: v.perSideSheets || v.totalSheetsPerSide || 0, runFt: v.perPanelLen || lengthFt, contributors: ['right'] })
  }

  // Front end
  if (opts.frontEnd === 'Horizontal') {
    const courses = resolveEndCourses(opts.frontEndCourses)
    let qty = courses
    // add gable waste only when fully enclosed (courses == endCourses) and pitch > 0
    const pitch = roofPitchX12
    const fullyEnclosed = courses >= endCourses
    if (fullyEnclosed && pitch > 0) qty += 1
    rows.push({ label: 'Front End', qty, runFt: widthFt, contributors: ['front'] })
  } else if (opts.frontEnd === 'Vertical') {
    const v = computeWallPanels(widthFt, legHeightFt, 'vertical', true, 'full')
    rows.push({ label: 'Front End (V)', qty: v.perSideSheets || v.totalSheetsPerSide || 0, runFt: v.perPanelLen || widthFt, contributors: ['front'] })
  }

  // Back end
  if (opts.backEnd === 'Horizontal') {
    const courses = resolveEndCourses(opts.backEndCourses)
    let qty = courses
    const pitch = roofPitchX12
    const fullyEnclosed = courses >= endCourses
    if (fullyEnclosed && pitch > 0) qty += 1
    rows.push({ label: 'Back End', qty, runFt: widthFt, contributors: ['back'] })
  } else if (opts.backEnd === 'Vertical') {
    const v = computeWallPanels(widthFt, legHeightFt, 'vertical', true, 'full')
    rows.push({ label: 'Back End (V)', qty: v.perSideSheets || v.totalSheetsPerSide || 0, runFt: v.perPanelLen || widthFt, contributors: ['back'] })
  }

  // aggregate identical run lengths
  // aggregate identical run lengths and collect contributors
  const agg = new Map<number, { qty: number; runFt: number; contributors: string[] }>()
  for (const r of rows) {
    const key = r.runFt
    const existing = agg.get(key)
    if (existing) {
      existing.qty += r.qty
      existing.contributors = Array.from(new Set(existing.contributors.concat(r.contributors || [])))
    } else {
      agg.set(key, { qty: r.qty, runFt: r.runFt, contributors: r.contributors ? [...r.contributors] : [] })
    }
  }

  const result = Array.from(agg.values()).map(v => ({ qty: v.qty, runFt: v.runFt, contributors: v.contributors }))
  return { rows, aggregated: result, horizontalSummary }
}
