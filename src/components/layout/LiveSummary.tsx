import React from 'react'
import { useAtom } from 'jotai'
import { selectedWidgetAtom } from '../../state/atoms'
import { computeTrussCount, computeLegCount, estimateBraces } from '../../lib/calc/framing'
import { roofPanelSheets } from '../../lib/calc/panels'
import { computeHorizontalPanelSummary } from '../../lib/calc/horizontalPanels'
import { breakdownTrims } from '../../lib/calc/trims'
import { countAnchorsDetailed } from '../../lib/calc/anchors'
import { computeOpeningReinforcement } from '../../lib/calc/openings'
import { formatFeetToFtIn } from '../../lib/format/length'

export default function LiveSummary({ job }: { job: any }) {
  const ColorChip = (props: { color?: string }) => {
    const c = props.color || ''
    if (!c) return <span>—</span>
    return (
      <span className="inline-flex items-center gap-2 ml-2 align-middle">
        <span style={{ width: 12, height: 12, background: c, display: 'inline-block', borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)' }} />
        <span className="text-xs">{c}</span>
      </span>
    )
  }
  const trusses = computeTrussCount(job.length, job.spacing)
  const legs = computeLegCount(trusses)
  const braces = estimateBraces(job.width, job.length, job.legHeight)
  const panels = roofPanelSheets(job.width, job.length, job.roofOrientation)
  const trims = breakdownTrims({ eave: job.width * 2, rake: job.length * 2, gable: 0, corner: 4 })
  const anchors = countAnchorsDetailed(legs, job.foundation || 'bare', job.frameGauge, job.width)
  const openings = computeOpeningReinforcement(job.openings || [], job.width)

  const horizontalSummary = computeHorizontalPanelSummary({ lengthFt: job.length, widthFt: job.width, legHeightFt: job.legHeight, panelCoverageFt: job.panelCoverageFt, roofPitchX12: job.pitch ?? 0 })

  const leftCourses = (job.wallOrientation === 'horizontal') ? (job.leftSideCourses ?? horizontalSummary.sideCourses) : 0
  const rightCourses = (job.wallOrientation === 'horizontal') ? (job.rightSideCourses ?? horizontalSummary.sideCourses) : 0
  const frontCourses = (job.wallOrientation === 'horizontal') ? (job.frontEndCourses ?? horizontalSummary.endCourses) : 0
  const backCourses = (job.wallOrientation === 'horizontal') ? (job.backEndCourses ?? horizontalSummary.endCourses) : 0

  const roofPitch = job.pitch ?? 0
  const frontGableExtra = (job.wallOrientation === 'horizontal' && frontCourses >= horizontalSummary.endCourses && roofPitch > 0) ? 1 : 0
  const backGableExtra = (job.wallOrientation === 'horizontal' && backCourses >= horizontalSummary.endCourses && roofPitch > 0) ? 1 : 0

  const leftRun = job.length
  const rightRun = job.length
  const frontRun = job.width
  const backRun = job.width

  // Wainscot handling: if enabled and fully enclosed for that wall, the bottom course is treated as wainscot (not regular wall panel)
  const wainscotMode = job.wallPanelMode === 'wainscot' && job.wallOrientation === 'horizontal'
  const maxSideCourses = horizontalSummary.sideCourses || 0
  const maxEndCourses = horizontalSummary.endCourses || 0
  const leftWainscot = wainscotMode && leftCourses >= maxSideCourses && maxSideCourses > 0 ? 1 : 0
  const rightWainscot = wainscotMode && rightCourses >= maxSideCourses && maxSideCourses > 0 ? 1 : 0
  const frontWainscot = wainscotMode && frontCourses >= maxEndCourses && maxEndCourses > 0 ? 1 : 0
  const backWainscot = wainscotMode && backCourses >= maxEndCourses && maxEndCourses > 0 ? 1 : 0

  const leftDisplay = Math.max(0, leftCourses - leftWainscot)
  const rightDisplay = Math.max(0, rightCourses - rightWainscot)
  const frontDisplay = Math.max(0, frontCourses - frontWainscot) + frontGableExtra
  const backDisplay = Math.max(0, backCourses - backWainscot) + backGableExtra

  const sideTotal = leftDisplay + rightDisplay
  const frontTotal = frontDisplay
  const backTotal = backDisplay
  const endTotal = frontDisplay + backDisplay

  const [, setSelectedWidget] = useAtom(selectedWidgetAtom)

  function onMouseEnter() {
    setSelectedWidget('aside')
  }

  function onMouseLeave() {
    setSelectedWidget(null)
  }

  // Drag/keyboard swap handle removed per request

  return (
    <div className="card relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* drag handle removed */}
      <h3 className="font-semibold mb-2">Live Summary</h3>
      <div className="text-sm text-muted-500">{job.buildingType} — {job.width}ft × {job.length}ft × {job.legHeight}ft</div>
      <div className="mt-3 text-sm">
        <div className="mb-3">
          <h4 className="font-semibold">Panels</h4>
          <div className="text-sm ml-2">
            <div className="font-medium">Roof Panels:<ColorChip color={job.panelColorRoof} /></div>
            <div>{panels.totalSheets} @ {formatFeetToFtIn(panels.panelLen)}</div>

            <div className="mt-2 font-medium">Side Panels:<ColorChip color={job.panelColorSide} /></div>
            { (leftDisplay === rightDisplay) ? (
              <div>{sideTotal} @ {formatFeetToFtIn(leftRun)}</div>
            ) : (
              <>
                <div>Left Side: {leftDisplay} @ {formatFeetToFtIn(leftRun)}</div>
                <div>Right Side: {rightDisplay} @ {formatFeetToFtIn(rightRun)}</div>
              </>
            )}

            <div className="mt-2 font-medium">End Panels:<ColorChip color={job.panelColorEnd || job.panelColorSide} /></div>
            { (frontDisplay === backDisplay) ? (
              <div>{endTotal} @ {formatFeetToFtIn(frontRun)}</div>
            ) : (
              <>
                <div>Front End: {frontDisplay} @ {formatFeetToFtIn(frontRun)}</div>
                <div>Back End: {backDisplay} @ {formatFeetToFtIn(backRun)}</div>
              </>
            )}

            <div className="text-xs mt-2">Courses: side {horizontalSummary.sideCourses}, end {horizontalSummary.endCourses} · Gable rise: {formatFeetToFtIn(horizontalSummary.gableRiseFt)}</div>

            { wainscotMode && (leftWainscot + rightWainscot + frontWainscot + backWainscot > 0) && (
              <div className="mt-3">
                <div className="font-medium">Wainscot:<ColorChip color={job.wainscotColor} /></div>
                { (leftWainscot + rightWainscot) > 0 && (
                  (leftWainscot === rightWainscot)
                    ? <div>{leftWainscot + rightWainscot} @ {formatFeetToFtIn(leftRun)} (sides)</div>
                    : <>
                        {leftWainscot > 0 && <div>Left Side: {leftWainscot} @ {formatFeetToFtIn(leftRun)}</div>}
                        {rightWainscot > 0 && <div>Right Side: {rightWainscot} @ {formatFeetToFtIn(rightRun)}</div>}
                      </>
                )}
                { (frontWainscot + backWainscot) > 0 && (
                  (frontWainscot === backWainscot)
                    ? <div>{frontWainscot + backWainscot} @ {formatFeetToFtIn(frontRun)} (ends)</div>
                    : <>
                        {frontWainscot > 0 && <div>Front End: {frontWainscot} @ {formatFeetToFtIn(frontRun)}</div>}
                        {backWainscot > 0 && <div>Back End: {backWainscot} @ {formatFeetToFtIn(backRun)}</div>}
                      </>
                )}
              </div>
            )}

            { Array.isArray(job.extraPanels) && job.extraPanels.length > 0 && (
              <div className="mt-3">
                <div className="font-medium">Extra Panels:</div>
                <div className="space-y-1">
                  {job.extraPanels.map((p: any, idx: number) => {
                    const qty = Number(p?.qty || 0)
                    const len = Number(p?.lengthFt || 0)
                    if (!qty || !len) return null
                    return <div key={idx}>{qty} @ {formatFeetToFtIn(len)}{p?.color ? ` — ${p.color}` : ''}</div>
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>Trusses: {trusses}</div>
        <div>Legs: {legs}</div>
        <div>Braces (est): {braces}</div>
        <div>Roof Sheets: {panels.totalSheets} — {formatFeetToFtIn(panels.panelLen)}</div>

        <div className="mt-2">Trim (pieces, 11' each):</div>
        <div className="text-xs ml-2">
          {(() => {
            const find = (type: string) => trims.items.find((it: any) => it.type === type)
            const eave = find('eave')?.roundedLF ?? 0
            const rake = find('rake')?.roundedLF ?? 0
            const gable = find('gable')?.roundedLF ?? 0
            const corner = find('corner')?.roundedLF ?? 0
            const ridgePieces = (typeof job.length === 'number' && job.length > 0) ? Math.ceil(((job.length || 0) + 1) / 11) : 0
            return (
              <>
                <div className="flex items-center gap-2">Eave: {Math.ceil(eave / 11)} pcs <ColorChip color={job.trim?.color} /></div>
                <div className="flex items-center gap-2">Rake: {Math.ceil(rake / 11)} pcs <ColorChip color={job.trim?.color} /></div>
                <div className="flex items-center gap-2">Gable: {Math.ceil(gable / 11)} pcs <ColorChip color={job.trim?.color} /></div>
                <div className="flex items-center gap-2">Corner: {Math.ceil(corner / 11)} pcs <ColorChip color={job.trim?.color} /></div>
                <div className="flex items-center gap-2">Ridgecap: {ridgePieces} pcs <span className="text-[10px] text-muted-500">(roof color)</span> <ColorChip color={job.panelColorRoof} /></div>
              </>
            )
          })()}
        </div>

        <div className="mt-2">Anchors: {anchors.qty} ({anchors.type})</div>
        { (job.openings || []).length > 0 && (
          <div className="mt-2">Openings: Headers {openings.headerLF} ft, L-Brackets {openings.lBrackets}, Blocking {openings.blocking}</div>
        )}
        {Array.isArray(job.leanTos) && job.leanTos.length > 0 && (
          <div className="mt-3">
            <div className="font-semibold">Lean-tos</div>
            <div className="space-y-2 mt-1 text-xs">
              {job.leanTos.map((lt: any, idx: number) => {
                const label = (lt.position || '').charAt(0).toUpperCase() + (lt.position || '').slice(1)
                const roof = roofPanelSheets(lt.width, lt.length, lt.roofOrientation)
                const hsum = computeHorizontalPanelSummary({ lengthFt: lt.length, widthFt: lt.width, legHeightFt: lt.legHeight, panelCoverageFt: job.panelCoverageFt, roofPitchX12: lt.pitch ?? 0 })
                const sideCourses = lt.wallOrientation === 'horizontal' ? (lt.leftSideCourses ?? hsum.sideCourses) : 0
                const endCourses = lt.wallOrientation === 'horizontal' ? (lt.frontEndCourses ?? hsum.endCourses) : 0
                const ridgePieces = (typeof lt.length === 'number' && lt.length > 0) ? Math.ceil(((lt.length || 0) + 1) / 11) : 0
                const trimsLt = breakdownTrims({ eave: (lt.width || 0) * 2, rake: (lt.length || 0) * 2, gable: 0, corner: 4 })
                const findLt = (type: string) => trimsLt.items.find((it: any) => it.type === type)
                const eaveLt = findLt('eave')?.roundedLF ?? 0
                const rakeLt = findLt('rake')?.roundedLF ?? 0
                const gableLt = findLt('gable')?.roundedLF ?? 0
                const cornerLt = findLt('corner')?.roundedLF ?? 0
                return (
                  <div key={idx} className="border-t border-[rgba(255,255,255,0.08)] pt-2">
                    <div className="font-medium">{label} — {lt.width}×{lt.length}×{lt.legHeight}</div>
                    <div>Roof: {roof.totalSheets} @ {formatFeetToFtIn(roof.panelLen)} <ColorChip color={lt.panelColorRoof} /></div>
                    {lt.wallOrientation === 'horizontal' && (
                      <div>Walls: Sides {sideCourses}, Ends {endCourses} <ColorChip color={lt.panelColorSide} /></div>
                    )}
                    <div className="mt-1">Trim (11' pieces):</div>
                    <div className="text-[11px] ml-2">
                      <div className="flex items-center gap-2">Eave: {Math.ceil(eaveLt / 11)} pcs <ColorChip color={job.trim?.color} /></div>
                      <div className="flex items-center gap-2">Rake: {Math.ceil(rakeLt / 11)} pcs <ColorChip color={job.trim?.color} /></div>
                      <div className="flex items-center gap-2">Gable: {Math.ceil(gableLt / 11)} pcs <ColorChip color={job.trim?.color} /></div>
                      <div className="flex items-center gap-2">Corner: {Math.ceil(cornerLt / 11)} pcs <ColorChip color={job.trim?.color} /></div>
                      <div className="flex items-center gap-2">Ridgecap: {ridgePieces} pcs <span className="text-[10px] text-muted-500">(roof color)</span> <ColorChip color={lt.panelColorRoof} /></div>
                    </div>
                    {Array.isArray(lt.extraPanels) && lt.extraPanels.length > 0 && (
                      <div className="mt-1">
                        <div className="font-medium">Extra Panels:</div>
                        <div className="space-y-0.5">
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
                )
              })}
            </div>
          </div>
        )}
        {panels.exceeds && <div className="text-yellow-400 mt-2">Warning: panel length {formatFeetToFtIn(panels.panelLen)} exceeds 31' shipping limit</div>}
      </div>
    </div>
  )
}
