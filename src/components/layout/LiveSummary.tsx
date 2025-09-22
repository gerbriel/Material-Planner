import React from 'react'
import { useAtom } from 'jotai'
import { layoutOrderAtom, selectedWidgetAtom, stackedAtom } from '../../state/atoms'
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

  // drag-to-swap/stack support: header acts as grab handle for moving the aside
  const dragging = React.useRef<{ startX: number | null; startY: number | null }>({ startX: null, startY: null })
  const [, setLayoutOrder] = useAtom(layoutOrderAtom)
  const [, setSelectedWidget] = useAtom(selectedWidgetAtom)
  const [stacked, setStacked] = useAtom(stackedAtom)

  function onMouseEnter() {
    setSelectedWidget('aside')
  }

  function onMouseLeave() {
    setSelectedWidget(null)
  }

  function onHandleKeyDown(e: React.KeyboardEvent) {
    // ignore key handling when focus is inside a resizer (defensive)
    const target = e.target as HTMLElement | null
    let node: any = target
    while (node) {
      if (node.getAttribute && node.getAttribute('data-resizer') === 'true') return
      node = node.parentNode
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const nextStacked = !stacked
      try { setStacked(nextStacked); localStorage.setItem('mbuilder:stacked', String(nextStacked)) } catch (err) {}
      return
    }
    if (e.key === 'ArrowLeft') {
      try { setLayoutOrder('main-left'); localStorage.setItem('mbuilder:layoutOrder', 'main-left') } catch (err) {}
      return
    }
    if (e.key === 'ArrowRight') {
      try { setLayoutOrder('main-right'); localStorage.setItem('mbuilder:layoutOrder', 'main-right') } catch (err) {}
      return
    }
    if (e.key === 'ArrowUp') {
      try { setStacked(false); localStorage.setItem('mbuilder:stacked', 'false') } catch (err) {}
      return
    }
    if (e.key === 'ArrowDown') {
      try { setStacked(true); localStorage.setItem('mbuilder:stacked', 'true') } catch (err) {}
      return
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    // ignore pointer interactions that come from a resizer handle
    let node: any = e.target
    while (node) {
      if (node.getAttribute && node.getAttribute('data-resizer') === 'true') return
      node = node.parentNode
    }
    (e.currentTarget as Element).setPointerCapture(e.pointerId)
    dragging.current.startX = e.clientX
    dragging.current.startY = e.clientY
    setSelectedWidget('aside')
  }

  function onPointerUp(e: React.PointerEvent) {
    const startX = dragging.current.startX
    const startY = dragging.current.startY
    dragging.current.startX = null
    dragging.current.startY = null
    if (startX == null || startY == null) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    // horizontal drag switches left/right
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      const next = dx > 0 ? 'main-left' : 'main-right'
      try { setLayoutOrder(next); localStorage.setItem('mbuilder:layoutOrder', next) } catch (err) {}
    }
    // vertical drag switches stacked mode if over threshold
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
      const nextStacked = !stacked
      try { setStacked(nextStacked); localStorage.setItem('mbuilder:stacked', String(nextStacked)) } catch (err) {}
    }
  }

  return (
    <div className="card relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag to swap main and aside layout"
        className="absolute -left-4 top-4 w-8 h-8 flex items-center justify-center"
        style={{ cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onKeyDown={onHandleKeyDown}
        title="Drag to swap main and aside layout"
      >
        <div style={{ width:18, height:18, borderRadius:4, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.04)' }} />
      </div>
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
        {job.leanToPresent && <div className="mt-2">Lean-tos: {job.leanToCount || 0}</div>}
        {panels.exceeds && <div className="text-yellow-400 mt-2">Warning: panel length {formatFeetToFtIn(panels.panelLen)} exceeds 31' shipping limit</div>}
      </div>
    </div>
  )
}
