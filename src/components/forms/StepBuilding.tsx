import React, { useEffect, useState } from 'react'
import Tooltip from '../ui/Tooltip'
import { useAtom } from 'jotai'
import { jobAtom } from '../../state/atoms'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { jobSchema } from '../../state/schema'
import StepNav from '../ui/StepNav'
import { makeDefaultLeanTo } from '../../state/defaults'
import ExtraPanelsEditor from './ExtraPanelsEditor'
import OpeningsEditor from './OpeningsEditor'
import LeanToEditor from './LeanToEditor'


export default function StepBuilding() {
  const [job, setJob] = useAtom(jobAtom)
  const [errors, setErrors] = useState<string | null>(null)
  const prevColorsRef = React.useRef<{ roof?: string; side?: string; end?: string; wainscot?: string }>({
    roof: undefined,
    side: undefined,
    end: undefined,
    wainscot: undefined
  })

  const update = (patch: any) => {
    setJob({ ...job, ...patch })
  }

  function capitalize(s: string) {
    if (!s) return s
    return s[0].toUpperCase() + s.slice(1)
  }

  const resetBlank = () => {
    // ask for confirmation before wiping the job
    // using window.confirm for a simple prompt
    // eslint-disable-next-line no-alert
    if (!window.confirm('Reset the job to blank values? This will clear the current job.')) return
    // minimal blank job preserving required keys
    setJob({
      buildingType: '',
      frameGauge: '14ga',
      panelGauge: '29ga',
      color: '',
      width: 0,
      length: 0,
      legHeight: 0,
      pitch: 2,
      spacing: 0,
      roofOrientation: 'vertical',
      wallOrientation: 'open',
      openings: [],
      trim: { closure: 'none', anchorType: 'bolt' },
      panelColorRoof: '',
      panelColorSide: '',
      panelColorEnd: '',
      wallPanelMode: 'full',
      leanToPresent: false,
      leanToCount: 0,
      wallStripCount: 4
    })
  }

  const onNext = () => {
    const result = jobSchema.safeParse(job)
    if (!result.success) {
      setErrors(result.error.errors.map((e) => e.message).join(', '))
      return
    }
    setErrors(null)
    // advance handled by StepNav default
    ;(document.activeElement as HTMLElement)?.blur()
  }

  // Keep lean-to colors in sync with main building colors unless user changed them explicitly.
  // Rule: If a lean-to color is undefined/blank or it equals the previous main color, update it to the new main color.
  React.useEffect(() => {
    const mainRoof = job.panelColorRoof
    const mainSide = job.panelColorSide
    const mainEnd = job.panelColorEnd || job.panelColorSide
    const mainWainscot = job.wainscotColor
    const prev = prevColorsRef.current
    if (!Array.isArray(job.leanTos) || job.leanTos.length === 0) {
      prevColorsRef.current = { roof: mainRoof, side: mainSide, end: mainEnd, wainscot: mainWainscot }
      return
    }
    let changed = false
    const nextLeanTos = job.leanTos.map((lt: any) => {
      const next: any = { ...lt }
      // roof
      if (!next.panelColorRoof || next.panelColorRoof === prev.roof) {
        if (mainRoof && next.panelColorRoof !== mainRoof) { next.panelColorRoof = mainRoof; changed = true }
      }
      // side
      if (!next.panelColorSide || next.panelColorSide === prev.side) {
        if (mainSide && next.panelColorSide !== mainSide) { next.panelColorSide = mainSide; changed = true }
      }
      // end
      const inheritEnd = mainEnd
      if (!next.panelColorEnd || next.panelColorEnd === prev.end || next.panelColorEnd === next.panelColorSide) {
        if (inheritEnd && next.panelColorEnd !== inheritEnd) { next.panelColorEnd = inheritEnd; changed = true }
      }
      // wainscot
      if (!next.wainscotColor || next.wainscotColor === prev.wainscot) {
        if (typeof mainWainscot === 'string' && next.wainscotColor !== mainWainscot) { next.wainscotColor = mainWainscot; changed = true }
      }
      return next
    })
    if (changed) setJob({ ...job, leanTos: nextLeanTos })
    prevColorsRef.current = { roof: mainRoof, side: mainSide, end: mainEnd, wainscot: mainWainscot }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.panelColorRoof, job.panelColorSide, job.panelColorEnd, job.wainscotColor])

  // compute panel option maxima
  const panelCoverageFt = job.panelCoverageFt ?? 3
  const baseHeightForPanels = job.buildingType === 'lean_to' ? (job.lowSideHeight || job.legHeight || 0) : (job.legHeight || 0)
  const maxCoursesSide = baseHeightForPanels ? Math.ceil(baseHeightForPanels / panelCoverageFt) : 0
  const gableRiseFt = (job.pitch ?? 0) / 12 * ((job.width ?? 0) / 2)
  const maxCoursesEnd = baseHeightForPanels ? Math.ceil(((baseHeightForPanels ?? 0) + gableRiseFt) / panelCoverageFt) : 0

  function makeSideOptions(max: number) {
    const opts: Array<{ label: string; value: number }> = []
    if (max < 1) return opts
    // Only whole panels from 1..max
    for (let i = 1; i <= max; i++) {
      opts.push({ label: i === 1 ? '1 panel' : `${i} panels`, value: i })
    }
    return opts
  }

  function makeEndOptions(max: number) {
    const opts: Array<{ label: string; value: number }> = []
    if (max < 1) return opts
    // Only whole panels; keep helpful names for the first two when available
    opts.push({ label: 'Gable (1 panel)', value: 1 })
    if (max >= 2) opts.push({ label: 'Extended gable (2 panels)', value: 2 })
    for (let i = 3; i <= max; i++) opts.push({ label: `${i} panels`, value: i })
    return opts
  }

  const sideOptions = makeSideOptions(maxCoursesSide)
  const endOptions = makeEndOptions(maxCoursesEnd)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold">Building</h2>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm">Building Type</label>
            <Select value={job.buildingType || ''} onChange={(e: any) => update({ buildingType: e.target.value })}>
              <option value="">—</option>
              <option value="carport">Carport</option>
              <option value="rv_cover">RV Cover</option>
              <option value="garage">Garage</option>
              <option value="barn">Barn</option>
              <option value="lean_to">Lean-to</option>
              <option value="combo">Combo</option>
              <option value="widespan">Widespan</option>
              <option value="utility_garage">Utility Garage</option>
            </Select>
          </div>
          <div className="min-w-[220px]">
            <label className="block text-sm">Work Order #</label>
            <Input value={job.workOrderId || ''} onChange={(e: any) => update({ workOrderId: e.target.value })} placeholder="e.g. WO-12345" />
          </div>
        </div>
      </div>
      {errors && <div className="text-red-400">{errors}</div>}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Core dimensions */}
        <div>
          <label className="block text-sm">Width (ft) <span className="text-xs text-muted-500">(end-wall span)</span></label>
          <Input value={job.width === undefined || job.width === null ? '' : job.width} onChange={(e: any) => update({ width: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm">Length (ft) <span className="text-xs text-muted-500">(side-wall run)</span></label>
          <Input value={job.length === undefined || job.length === null ? '' : job.length} onChange={(e: any) => update({ length: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        {job.buildingType === 'lean_to' ? (
          <>
            <div>
              <label className="block text-sm">High Side Height (ft)</label>
              <Input value={job.highSideHeight ?? ''} onChange={(e: any) => update({ highSideHeight: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm">Low Side Height (ft)</label>
              <Input value={job.lowSideHeight ?? ''} onChange={(e: any) => update({ lowSideHeight: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm">Height (Leg) (ft)</label>
            <Input value={job.legHeight === undefined || job.legHeight === null ? '' : job.legHeight} onChange={(e: any) => update({ legHeight: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </div>
        )}

        {/* Roof style maps to roofOrientation */}
        <div>
          <label className="block text-sm">Roof Style</label>
          <Select value={job.roofStyle || (job.roofOrientation ? (job.roofOrientation === 'vertical' ? 'a_frame_vertical' : 'a_frame_horizontal') : '')} onChange={(e: any) => {
            const v = e.target.value
            let orientation: 'vertical' | 'horizontal' | '' = ''
            if (v === 'standard') orientation = 'horizontal'
            if (v === 'a_frame_horizontal') orientation = 'horizontal'
            if (v === 'a_frame_vertical') orientation = 'vertical'
            update({ roofStyle: v, roofOrientation: orientation || job.roofOrientation })
          }}>
            <option value="">—</option>
            <option value="standard">Standard</option>
            <option value="a_frame_horizontal">A Frame (Horizontal)</option>
            <option value="a_frame_vertical">A Frame (Vertical)</option>
          </Select>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm">Roof Color</label>
          <Select value={job.panelColorRoof || ''} onChange={(e: any) => update({ panelColorRoof: e.target.value })}>
            <option value="">—</option>
            <option value="Galvalume">Galvalume</option>
            <option value="White">White</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Tan">Tan</option>
            <option value="Green">Green</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm">Sides & Ends Color</label>
          <Select value={job.panelColorSide || ''} onChange={(e: any) => update({ panelColorSide: e.target.value, panelColorEnd: e.target.value })}>
            <option value="">—</option>
            <option value="Galvalume">Galvalume</option>
            <option value="White">White</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Tan">Tan</option>
            <option value="Green">Green</option>
          </Select>
        </div>

        {/* Has Wainscot — placed right after Sides & Ends Color; inline color to the right of checkbox */}
        <div>
          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={job.wallPanelMode === 'wainscot'} onChange={(e: any) => update({ wallPanelMode: e.target.checked ? 'wainscot' : 'full' })} />
              <span className="text-sm">Has Wainscot</span>
            </label>
            {job.wallPanelMode === 'wainscot' && (
              <div className="min-w-[160px]">
                <label className="block text-sm">Wainscot Color</label>
                <Select value={job.wainscotColor || ''} onChange={(e: any) => update({ wainscotColor: e.target.value })}>
                  <option value="">—</option>
                  <option value="Galvalume">Galvalume</option>
                  <option value="White">White</option>
                  <option value="Red">Red</option>
                  <option value="Blue">Blue</option>
                  <option value="Tan">Tan</option>
                  <option value="Green">Green</option>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm">Trim Color</label>
          <Select value={job.trim?.color || ''} onChange={(e: any) => update({ trim: { ...(job.trim || {}), color: e.target.value } })}>
            <option value="">—</option>
            <option value="Galvalume">Galvalume</option>
            <option value="White">White</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Tan">Tan</option>
            <option value="Green">Green</option>
          </Select>
        </div>

        {/* Extra Panels — moved to appear right after Trim Color */}
        <div className="col-span-2">
          <label className="block text-sm">Extra Panels</label>
          <ExtraPanelsEditor panels={job.extraPanels || []} onChange={(list) => update({ extraPanels: list })} />
        </div>

        {/* Gauges */}
        <div>
          <label className="block text-sm">Panel Gauge</label>
          <Select value={job.panelGauge || ''} onChange={(e: any) => update({ panelGauge: e.target.value })}>
            <option value="">—</option>
            <option value="29ga">29-ga (default)</option>
            <option value="26ga">26-ga (upgrade)</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm">Frame Gauge</label>
          <Select value={job.frameGauge || ''} onChange={(e: any) => update({ frameGauge: e.target.value })}>
            <option value="">—</option>
            <option value="14ga">14-ga (default)</option>
            <option value="12ga">12-ga (upgrade)</option>
          </Select>
        </div>

        {/* Pitch & Spacing */}
        <div>
          <label className="block text-sm">Pitch</label>
          <Select value={job.pitch ?? ''} onChange={(e: any) => update({ pitch: e.target.value === '' ? undefined : Number(e.target.value) })}>
            <option value="">—</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm">Spacing</label>
          <Input value={job.spacing === undefined || job.spacing === null ? '' : job.spacing} onChange={(e: any) => update({ spacing: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>

        {/* Wall Enclosure - Global selection */}
        <div className="col-span-2">
          <label className="block text-sm">Wall Enclosure (Global)</label>
          <Select value={job.wallOrientation || ''} onChange={(e: any) => {
            const val = e.target.value
            const cap = capitalize(val)
            const patch: any = {
              wallOrientation: val,
              leftSide: cap,
              rightSide: cap,
              frontEnd: cap,
              backEnd: cap
            }
            if (val === 'open' || val === 'vertical') {
              patch.leftSideCourses = undefined
              patch.rightSideCourses = undefined
              patch.frontEndCourses = undefined
              patch.backEndCourses = undefined
            }
            setJob({ ...job, ...patch })
          }}>
            <option value="">—</option>
            <option value="open">Open</option>
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm">Left Side Wall</label>
          {job.wallOrientation === 'open' && <div className="mt-1 text-xs text-muted-500">No panels</div>}
          {job.wallOrientation === 'vertical' && <div className="mt-1 text-xs text-muted-500">Using vertical sheet logic</div>}
            {job.wallOrientation === 'horizontal' && (
            <div className="mt-1">
              <label className="text-xs">Panel Amount</label>
              <Select aria-label="Left side panel amount" aria-describedby="leftSideHelp" value={job.leftSideCourses ?? ''} onChange={(e: any) => {
                const v = e.target.value === '' ? undefined : Math.max(1, Math.min(maxCoursesSide, Number(e.target.value)))
                update({ leftSideCourses: v })
              }}>
                <option value="">Full height (max)</option>
                {sideOptions.map(o => <option key={o.value} value={o.value}>{o.label} — {o.value} {o.value === 1 ? 'panel' : 'panels'}</option>)}
              </Select>
              <div id="leftSideHelp" className="text-xs text-muted-500">Max: {maxCoursesSide}. "Full height" uses the maximum panels (may increase material).</div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm">Right Side Wall</label>
          {job.wallOrientation === 'open' && <div className="mt-1 text-xs text-muted-500">No panels</div>}
          {job.wallOrientation === 'vertical' && <div className="mt-1 text-xs text-muted-500">Using vertical sheet logic</div>}
            {job.wallOrientation === 'horizontal' && (
            <div className="mt-1">
              <label className="text-xs">Panel Amount</label>
              <Select aria-label="Right side panel amount" aria-describedby="rightSideHelp" value={job.rightSideCourses ?? ''} onChange={(e: any) => {
                const v = e.target.value === '' ? undefined : Math.max(1, Math.min(maxCoursesSide, Number(e.target.value)))
                update({ rightSideCourses: v })
              }}>
                <option value="">Full height (max)</option>
                {sideOptions.map(o => <option key={o.value} value={o.value}>{o.label} — {o.value} {o.value === 1 ? 'panel' : 'panels'}</option>)}
              </Select>
              <div id="rightSideHelp" className="text-xs text-muted-500">Max: {maxCoursesSide}. "Full height" uses the maximum panels (may increase material).</div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm">Front End Wall <Tooltip text="Horizontal adds +1 extra full-length sheet for gable cuts"> <span className="text-xs">(?)</span> </Tooltip></label>
          {job.wallOrientation === 'open' && <div className="mt-1 text-xs text-muted-500">No panels</div>}
          {job.wallOrientation === 'vertical' && <div className="mt-1 text-xs text-muted-500">Using vertical sheet logic</div>}
          {job.wallOrientation === 'horizontal' && (
            <div className="mt-1">
              <label className="text-xs">Panel Amount <Tooltip text="'Fully enclosed' (Full height) means full-height panels to the top; for horizontal walls this can add an extra full-length sheet for gable cuts/waste."> <span className="text-xs">(?)</span> </Tooltip></label>
              <Select aria-label="Front end panel amount" aria-describedby="frontEndHelp" value={job.frontEndCourses ?? ''} onChange={(e: any) => {
                const v = e.target.value === '' ? undefined : Math.max(1, Math.min(maxCoursesEnd, Number(e.target.value)))
                update({ frontEndCourses: v })
              }}>
                <option value="">Full height (fully enclosed)</option>
                {endOptions.map(o => <option key={o.value} value={o.value}>{o.label} — {o.value} {o.value === 1 ? 'panel' : 'panels'}</option>)}
              </Select>
              <div id="frontEndHelp" className="text-xs text-muted-500">Max: {maxCoursesEnd}. Choosing "Full height (fully enclosed)" may increase required sheets due to gable/waste.</div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm">Back End Wall <Tooltip text="Horizontal adds +1 extra full-length sheet for gable cuts"> <span className="text-xs">(?)</span> </Tooltip></label>
          {job.wallOrientation === 'open' && <div className="mt-1 text-xs text-muted-500">No panels</div>}
          {job.wallOrientation === 'vertical' && <div className="mt-1 text-xs text-muted-500">Using vertical sheet logic</div>}
          {job.wallOrientation === 'horizontal' && (
            <div className="mt-1">
              <label className="text-xs">Panel Amount <Tooltip text="'Fully enclosed' (Full height) means full-height panels to the top; for horizontal walls this can add an extra full-length sheet for gable cuts/waste."> <span className="text-xs">(?)</span> </Tooltip></label>
              <Select aria-label="Back end panel amount" aria-describedby="backEndHelp" value={job.backEndCourses ?? ''} onChange={(e: any) => {
                const v = e.target.value === '' ? undefined : Math.max(1, Math.min(maxCoursesEnd, Number(e.target.value)))
                update({ backEndCourses: v })
              }}>
                <option value="">Full height (fully enclosed)</option>
                {endOptions.map(o => <option key={o.value} value={o.value}>{o.label} — {o.value} {o.value === 1 ? 'panel' : 'panels'}</option>)}
              </Select>
              <div id="backEndHelp" className="text-xs text-muted-500">Max: {maxCoursesEnd}. Choosing "Full height (fully enclosed)" may increase required sheets due to gable/waste.</div>
            </div>
          )}
        </div>

        {job.wallPanelMode === 'strips' && (
          <div>
            <label className="block text-sm">Strips high (1-7)</label>
            <Input value={job.wallStripCount === undefined || job.wallStripCount === null ? '' : job.wallStripCount} onChange={(e: any) => update({ wallStripCount: e.target.value === '' ? undefined : Math.max(1, Math.min(7, Number(e.target.value) || 1)) })} />
          </div>
        )}

        

        {/* Openings (roll-ups, walk-ins, windows) */}
        <div className="col-span-2">
          <label className="block text-sm">Openings</label>
          <OpeningsEditor openings={job.openings || []} buildingWidth={job.width || 0} onChange={(list) => update({ openings: list })} />
        </div>

        {/* Foam enclosure strips */}
        <div>
          <label className="block text-sm">Foam Enclosure Strips</label>
          <div className="flex items-center gap-3 text-sm mt-1">
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!job.foam?.roof} onChange={(e) => update({ foam: { ...(job.foam||{}), roof: e.target.checked } })} /> Roof</label>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!job.foam?.sides} onChange={(e) => update({ foam: { ...(job.foam||{}), sides: e.target.checked } })} /> Sides</label>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!job.foam?.ends} onChange={(e) => update({ foam: { ...(job.foam||{}), ends: e.target.checked } })} /> Ends</label>
          </div>
        </div>

        {/* Insulation */}
        <div>
          <label className="block text-sm">Insulation</label>
          <div className="flex items-center gap-3 text-sm mt-1">
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!job.insulation?.roof} onChange={(e) => update({ insulation: { ...(job.insulation||{}), roof: e.target.checked } })} /> Roof</label>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!job.insulation?.sides} onChange={(e) => update({ insulation: { ...(job.insulation||{}), sides: e.target.checked } })} /> Sides</label>
            <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!job.insulation?.ends} onChange={(e) => update({ insulation: { ...(job.insulation||{}), ends: e.target.checked } })} /> Ends</label>
          </div>
        </div>

        {/* Braces, Hat Channels, Anchors */}
        <div>
          <label className="block text-sm">Extra Braces (qty)</label>
          <Input value={job.extraBraces ?? 0} onChange={(e: any) => update({ extraBraces: Number(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="block text-sm">Hat Channels (qty)</label>
          <Input value={job.hatChannels ?? 0} onChange={(e: any) => update({ hatChannels: Number(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="block text-sm">Anchors/Foundation</label>
          <Select value={job.foundation || 'bare'} onChange={(e: any) => update({ foundation: e.target.value })}>
            <option value="bare">Bare Ground</option>
            <option value="asphalt">Asphalt</option>
            <option value="concrete">Concrete</option>
          </Select>
        </div>

        <div className="col-span-2">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!job.leanToPresent} onChange={(e: any) => update({ leanToPresent: e.target.checked })} />
            <span className="text-sm">Has Lean-tos</span>
          </label>
          {job.leanToPresent && (
            <div className="mt-2 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['front','back','left','right'] as const).map((pos) => {
                  const enabled = (job.leanTos || []).some((lt: any) => lt.position === pos)
                  return (
                    <label key={pos} className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={enabled} onChange={(e: any) => {
                        const list = [...(job.leanTos || [])]
                        const idx = list.findIndex((lt: any) => lt.position === pos)
                        if (e.target.checked) {
                          if (idx === -1) {
                            const base = makeDefaultLeanTo(pos)
                            list.push({
                              ...base,
                              panelColorRoof: job.panelColorRoof || base.panelColorRoof,
                              panelColorSide: job.panelColorSide || base.panelColorSide,
                              panelColorEnd: (job.panelColorEnd || job.panelColorSide || base.panelColorEnd),
                              wainscotColor: job.wainscotColor || base.wainscotColor
                            })
                          }
                        } else {
                          if (idx !== -1) list.splice(idx, 1)
                        }
                        update({ leanTos: list })
                      }} />
                      <span>{pos[0].toUpperCase()+pos.slice(1)} Lean-to</span>
                    </label>
                  )
                })}
              </div>

              {(job.leanTos || []).length > 0 && (
                <div className="space-y-4">
                  {(job.leanTos || []).map((lt: any, i: number) => (
                    <LeanToEditor
                      key={lt.position}
                      leanTo={lt}
                      onChange={(patch) => {
                        const list = [...(job.leanTos || [])]
                        list[i] = { ...list[i], ...patch }
                        update({ leanTos: list })
                      }}
                      onRemove={() => {
                        const list = [...(job.leanTos || [])]
                        list.splice(i, 1)
                        update({ leanTos: list })
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  {/* Step navigation moved under Live Summary (page 1) */}
    </div>
  )
}

// Local component stubs removed; using shared components instead.
