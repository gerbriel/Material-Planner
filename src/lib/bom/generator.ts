import { computeTrussCount, computeLegCount } from '../calc/framing'
import { roofPanelSheets, computeWallPanels } from '../calc/panels'
import { breakdownTrims } from '../calc/trims'
import { countAnchorsDetailed, countAnchors } from '../calc/anchors'
import { countRoofScrewsByGauge } from '../calc/screws'
import { computeOpeningReinforcement } from '../calc/openings'
import { computeWallsAggregate } from '../calc/wallsAggregate'
import { computeHorizontalPanelSummary } from '../calc/horizontalPanels'

export function buildSimpleBom(job: any) {
  const trusses = computeTrussCount(job.length, job.spacing)
  const legs = computeLegCount(trusses)
  const panels = roofPanelSheets(job.width, job.length, job.roofOrientation)
  const trims = breakdownTrims({ eave: job.width * 2, rake: job.length * 2, gable: 0, corner: 4 })
  const anchors = countAnchorsDetailed(legs, job.foundation || 'bare', job.frameGauge, job.width)
  const screws = countRoofScrewsByGauge(panels.totalSheets, job.panelGauge)
  const openings = computeOpeningReinforcement(job.openings || [], job.width)

  const bom: any[] = []
  bom.push({ category: 'Framing', item: 'Truss', description: 'Steel truss', gauge: job.frameGauge, qty: trusses, unit: 'ea' })
  bom.push({ category: 'Framing', item: 'Leg', description: 'Support leg', gauge: job.frameGauge, qty: legs, unit: 'ea' })
  // Roof panels (qty and panel length per your formula)
  bom.push({ category: 'Roof', item: 'Roof Panel', description: "3' width panel (roof)", gauge: job.panelGauge, qty: panels.totalSheets, unit: 'sheet', length: panels.panelLen, panelColor: job.panelColorRoof || '' })

  // Wall panels — reflect user's selections for side/end courses via wallsAggregate
  const wallMode = job.wallPanelMode || 'full'
  const enforceVertical = job.width > 30 // anything wider than 30' defaults to vertical orientation
  // compute aggregate rows (handles horizontal courses and gable extras)
  const wa = computeWallsAggregate({
    lengthFt: job.length || 0,
    widthFt: job.width || 0,
    legHeightFt: job.legHeight || 0,
    panelCoverageFt: job.panelCoverageFt || 3,
    roofPitchX12: job.pitch || 0,
    leftSide: (job.leftSide as any) || (enforceVertical ? 'Vertical' : (job.wallOrientation ? (job.wallOrientation[0].toUpperCase() + job.wallOrientation.slice(1)) : 'Open')),
    rightSide: (job.rightSide as any) || (enforceVertical ? 'Vertical' : (job.wallOrientation ? (job.wallOrientation[0].toUpperCase() + job.wallOrientation.slice(1)) : 'Open')),
    frontEnd: (job.frontEnd as any) || (enforceVertical ? 'Vertical' : (job.wallOrientation ? (job.wallOrientation[0].toUpperCase() + job.wallOrientation.slice(1)) : 'Open')),
    backEnd: (job.backEnd as any) || (enforceVertical ? 'Vertical' : (job.wallOrientation ? (job.wallOrientation[0].toUpperCase() + job.wallOrientation.slice(1)) : 'Open')),
    leftSideCourses: job.leftSideCourses,
    rightSideCourses: job.rightSideCourses,
    frontEndCourses: job.frontEndCourses,
    backEndCourses: job.backEndCourses,
  })

  // emit consolidated Side and End panel rows, preserving correct piece length
  const spacingLen = job.spacing || 5
  type Key = string
  const groupedByType = new Map<Key, { qty: number; sideOrEnd: 'side' | 'end'; pieceLengthFt: number; color: string }>()
  for (const r of wa.rows) {
    const contributors = r.contributors || []
    const isSide = contributors.some((c) => c === 'left' || c === 'right')
    const isEnd = contributors.some((c) => c === 'front' || c === 'back')
    if (!isSide && !isEnd) continue
    const vertical = (r.label || '').includes('(V)')
    const pieceLengthFt = vertical ? (r.runFt || spacingLen) : spacingLen
    const sideOrEnd: 'side' | 'end' = isSide ? 'side' : 'end'
    const color = sideOrEnd === 'side'
      ? (job.panelColorSide || '')
      : (job.panelColorEnd || job.panelColorSide || '')
    const key: Key = `${sideOrEnd}|${pieceLengthFt}`
    const cur = groupedByType.get(key)
    if (cur) cur.qty += r.qty
    else groupedByType.set(key, { qty: r.qty, sideOrEnd, pieceLengthFt, color })
  }

  // If wainscot mode is on and orientation is horizontal, move one bottom course per fully enclosed wall into a separate Wainscot line
  let wainscotSideSheets = 0
  let wainscotEndSheets = 0
  if (job.wallPanelMode === 'wainscot' && job.wallOrientation === 'horizontal') {
    const panelCoverageFt = job.panelCoverageFt || 3
    const summary = computeHorizontalPanelSummary({
      lengthFt: job.length || 0,
      widthFt: job.width || 0,
      legHeightFt: job.legHeight || 0,
      panelCoverageFt,
      roofPitchX12: job.pitch || 0
    })
    const leftCourses = job.leftSideCourses ?? summary.sideCourses
    const rightCourses = job.rightSideCourses ?? summary.sideCourses
    const frontCourses = job.frontEndCourses ?? summary.endCourses
    const backCourses = job.backEndCourses ?? summary.endCourses
    const leftFull = leftCourses >= (summary.sideCourses || 0)
    const rightFull = rightCourses >= (summary.sideCourses || 0)
    const frontFull = frontCourses >= (summary.endCourses || 0)
    const backFull = backCourses >= (summary.endCourses || 0)

    const sheetsPerSideCourse = Math.ceil((job.length || 0) / panelCoverageFt)
    const sheetsPerEndCourse = Math.ceil((job.width || 0) / panelCoverageFt)
    if (leftFull) wainscotSideSheets += sheetsPerSideCourse
    if (rightFull) wainscotSideSheets += sheetsPerSideCourse
    if (frontFull) wainscotEndSheets += sheetsPerEndCourse
    if (backFull) wainscotEndSheets += sheetsPerEndCourse

    // subtract from grouped side/end entries at horizontal piece length (spacing)
    const keySide: Key = `side|${spacingLen}`
    const keyEnd: Key = `end|${spacingLen}`
    const gSide = groupedByType.get(keySide)
    if (gSide) gSide.qty = Math.max(0, gSide.qty - wainscotSideSheets)
    const gEnd = groupedByType.get(keyEnd)
    if (gEnd) gEnd.qty = Math.max(0, gEnd.qty - wainscotEndSheets)
  }
  for (const g of groupedByType.values()) {
    const label = g.sideOrEnd === 'side' ? 'Side Panels' : 'End Panels'
    bom.push({ category: 'Walls', item: label, description: g.sideOrEnd === 'side' ? "3' width wall panel (side)" : "3' width wall panel (end)", gauge: job.panelGauge, qty: g.qty, unit: 'sheet', length: g.pieceLengthFt, pieceLengthFt: g.pieceLengthFt, sideOrEnd: g.sideOrEnd, modeUsed: wallMode, panelColor: g.color })
  }
  // Wainscot rows
  if ((wainscotSideSheets + wainscotEndSheets) > 0) {
    if (wainscotSideSheets > 0) {
      bom.push({ category: 'Walls', item: 'Wainscot (Sides)', description: "3' width wainscot panel (side)", gauge: job.panelGauge, qty: wainscotSideSheets, unit: 'sheet', length: spacingLen, pieceLengthFt: spacingLen, sideOrEnd: 'side', modeUsed: 'wainscot', panelColor: job.wainscotColor || '' })
    }
    if (wainscotEndSheets > 0) {
      bom.push({ category: 'Walls', item: 'Wainscot (Ends)', description: "3' width wainscot panel (end)", gauge: job.panelGauge, qty: wainscotEndSheets, unit: 'sheet', length: spacingLen, pieceLengthFt: spacingLen, sideOrEnd: 'end', modeUsed: 'wainscot', panelColor: job.wainscotColor || '' })
    }
  }
  // trims
  for (const t of trims.items) {
    const label = t.type.charAt(0).toUpperCase() + t.type.slice(1)
    const pieces = Math.ceil((t.roundedLF || 0) / 11)
    // emit each trim type as pieces of 11' stock and include trim color
    bom.push({ category: 'Trim', item: label, description: `${label} trim (11ft pieces)`, qty: pieces, unit: 'pcs', length: 11, panelColor: job.trim?.color || '', notes: `lf:${t.roundedLF}` })
  }
  // Ridgecap: pieces are based on building length plus 1' allowance
  // pieces = ceil((length + 1) / 11). Ridgecap color follows the roof panel color.
  if (typeof job.length === 'number' && job.length > 0) {
    const ridgeLf = (job.length || 0) + 1
    const ridgePieces = Math.ceil(ridgeLf / 11)
    bom.push({ category: 'Trim', item: 'Ridgecap', description: 'Ridge cap (11ft pieces)', qty: ridgePieces, unit: 'pcs', length: 11, panelColor: job.panelColorRoof || '', notes: `lf:${ridgeLf}` })
  }
  // keep Trim Sticks as an approximate total stick count (11' each)
  bom.push({ category: 'Trim', item: 'Trim Sticks', description: '11ft trim sticks (approx)', qty: trims.sticks, unit: 'pcs', length: 11, panelColor: job.trim?.color || '', notes: `waste:${trims.wasteFactor}` })
  // anchors
  bom.push({ category: 'Hardware', item: anchors.type, description: 'Anchors/fasteners', qty: anchors.qty, unit: anchors.type === 'asphalt_kit' ? 'kit' : 'ea' })
  // screws
  bom.push({ category: 'Hardware', item: 'Roof Screws', description: 'Assorted screws', qty: screws.total, unit: 'ea', notes: `bags:${screws.bags}` })
  // openings
  if ((job.openings || []).length > 0) {
    bom.push({ category: 'Openings', item: 'Headers (LF)', description: 'Opening headers', qty: openings.headerLF, unit: 'lf' })
    bom.push({ category: 'Openings', item: 'L-Brackets', description: 'L brackets for openings', qty: openings.lBrackets, unit: 'ea' })
    bom.push({ category: 'Openings', item: 'Blocking', description: 'Blocking pieces', qty: openings.blocking, unit: 'ea' })
  }
  // extra panels
  if (Array.isArray(job.extraPanels)) {
    for (const p of job.extraPanels) {
      const qty = Number(p?.qty || 0)
      const lengthFt = Number(p?.lengthFt || 0)
      if (qty > 0 && lengthFt > 0) {
        bom.push({ category: 'Panels', item: 'Panels (Extra)', description: 'Extra panels', qty, unit: 'sheet', length: lengthFt, pieceLengthFt: lengthFt, panelColor: p?.color || '' })
      }
    }
  }
  return bom
}
