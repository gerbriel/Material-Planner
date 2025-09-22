import React from 'react'
import { roofPanelSheets } from '../../lib/calc/panels'
import { computeHorizontalPanelSummary } from '../../lib/calc/horizontalPanels'
import { breakdownTrims } from '../../lib/calc/trims'
import { formatFeetToFtIn } from '../../lib/format/length'

export default function LeanToSummary({ job, lt }: { job: any, lt: any }) {
  const ColorChip = (props: { color?: string }) => {
    const c = props.color || ''
    if (!c) return <span>—</span>
    return (
      <span className="inline-flex items-center gap-2 ml-2 align-middle">
        <span className="color-chip" style={{ width: 12, height: 12, background: c, display: 'inline-block', borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)' }} />
        <span className="text-xs">{c}</span>
      </span>
    )
  }

  const label = (lt.position || '').charAt(0).toUpperCase() + (lt.position || '').slice(1)
  const roof = roofPanelSheets(lt.width, lt.length, lt.roofOrientation)
  const legForPanels = (lt.lowSideHeight ?? lt.legHeight)
  const hsum = computeHorizontalPanelSummary({ lengthFt: lt.length, widthFt: lt.width, legHeightFt: legForPanels, panelCoverageFt: job.panelCoverageFt, roofPitchX12: lt.pitch ?? 0 })
  const leftLtCourses = lt.wallOrientation === 'horizontal' ? (lt.leftSideCourses ?? hsum.sideCourses) : 0
  const rightLtCourses = lt.wallOrientation === 'horizontal' ? (lt.rightSideCourses ?? hsum.sideCourses) : 0
  const frontLtCourses = lt.wallOrientation === 'horizontal' ? (lt.frontEndCourses ?? hsum.endCourses) : 0
  const backLtCourses = lt.wallOrientation === 'horizontal' ? (lt.backEndCourses ?? hsum.endCourses) : 0
  const ltPanelCoverage = job.panelCoverageFt || 3
  const ltSheetsPerSideCourse = Math.ceil((lt.length || 0) / ltPanelCoverage)
  const ltSheetsPerEndCourse = Math.ceil((lt.width || 0) / ltPanelCoverage)
  const leftLtSheets = leftLtCourses * ltSheetsPerSideCourse
  const rightLtSheets = rightLtCourses * ltSheetsPerSideCourse
  const frontLtSheets = frontLtCourses * ltSheetsPerEndCourse
  const backLtSheets = backLtCourses * ltSheetsPerEndCourse
  const ridgePieces = (typeof lt.length === 'number' && lt.length > 0) ? Math.ceil(((lt.length || 0) + 1) / 11) : 0
  const trimsLt = breakdownTrims({ eave: (lt.width || 0) * 2, rake: (lt.length || 0) * 2, gable: 0, corner: 4 })
  const findLt = (type: string) => trimsLt.items.find((it: any) => it.type === type)
  const eaveLt = findLt('eave')?.roundedLF ?? 0
  const rakeLt = findLt('rake')?.roundedLF ?? 0
  const gableLt = findLt('gable')?.roundedLF ?? 0
  const cornerLt = findLt('corner')?.roundedLF ?? 0

  return (
    <div className="card relative">
      <h3 className="font-semibold mb-1">{label} Lean-to</h3>
      <div className="text-sm text-muted-500">{lt.width}×{lt.length}×{lt.legHeight} {typeof lt.highSideHeight==='number' || typeof lt.lowSideHeight==='number' ? (
        <span className="ml-1 text-[11px] text-muted-500">(high {lt.highSideHeight ?? '—'}', low {lt.lowSideHeight ?? '—'}')</span>
      ) : null}</div>
      <div className="mt-3 text-sm">
        <div className="font-medium">Roof Panels:<ColorChip color={lt.panelColorRoof} /></div>
        <div>{roof.totalSheets} @ {formatFeetToFtIn(roof.panelLen)}</div>
        {lt.wallOrientation === 'horizontal' && (
          <div className="mt-2">
            <div className="font-medium">Side Panels:<ColorChip color={lt.panelColorSide} /></div>
            {(leftLtSheets === rightLtSheets) ? (
              <div>{leftLtSheets + rightLtSheets} @ {formatFeetToFtIn(lt.length)}</div>
            ) : (
              <>
                <div>Left Side: {leftLtSheets} @ {formatFeetToFtIn(lt.length)}</div>
                <div>Right Side: {rightLtSheets} @ {formatFeetToFtIn(lt.length)}</div>
              </>
            )}
            <div className="mt-2 font-medium">End Panels:<ColorChip color={lt.panelColorEnd || lt.panelColorSide} /></div>
            {(frontLtSheets === backLtSheets) ? (
              <div>{frontLtSheets + backLtSheets} @ {formatFeetToFtIn(lt.width)}</div>
            ) : (
              <>
                <div>Front End: {frontLtSheets} @ {formatFeetToFtIn(lt.width)}</div>
                <div>Back End: {backLtSheets} @ {formatFeetToFtIn(lt.width)}</div>
              </>
            )}
          </div>
        )}
        <div className="mt-3">Trim (11' pieces):</div>
        <div className="text-xs ml-2">
          <div className="flex items-center gap-2">Eave: {Math.ceil(eaveLt / 11)} pcs <ColorChip color={job.trim?.color} /></div>
          <div className="flex items-center gap-2">Rake: {Math.ceil(rakeLt / 11)} pcs <ColorChip color={job.trim?.color} /></div>
          <div className="flex items-center gap-2">Gable: {Math.ceil(gableLt / 11)} pcs <ColorChip color={job.trim?.color} /></div>
          <div className="flex items-center gap-2">Corner: {Math.ceil(cornerLt / 11)} pcs <ColorChip color={job.trim?.color} /></div>
          <div className="flex items-center gap-2">Ridgecap: {ridgePieces} pcs <span className="text-[10px] text-muted-500">(roof color)</span> <ColorChip color={lt.panelColorRoof} /></div>
        </div>

        {Array.isArray(lt.extraPanels) && lt.extraPanels.length > 0 && (
          <div className="mt-3">
            <div className="font-medium">Extra Panels:</div>
            <div className="space-y-1">
              {lt.extraPanels.map((p: any, j: number) => {
                const qty = Number(p?.qty || 0)
                const len = Number(p?.lengthFt || 0)
                if (!qty || !len) return null
                return <div key={j}>{qty} @ {formatFeetToFtIn(len)}{p?.color ? ` — ${p.color}` : ''}</div>
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
