import React, { useEffect, useState } from 'react'
import Tooltip from '../ui/Tooltip'
import { useAtom } from 'jotai'
import { jobAtom } from '../../state/atoms'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { jobSchema } from '../../state/schema'
import StepNav from '../ui/StepNav'
import { makeDefaultLeanTo } from '../../state/defaults'


export default function StepBuilding() {
  const [job, setJob] = useAtom(jobAtom)
  const [errors, setErrors] = useState<string | null>(null)

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

  // compute panel option maxima
  const panelCoverageFt = job.panelCoverageFt ?? 3
  const maxCoursesSide = job.legHeight ? Math.ceil(job.legHeight / panelCoverageFt) : 0
  const gableRiseFt = (job.pitch ?? 0) / 12 * ((job.width ?? 0) / 2)
  const maxCoursesEnd = job.legHeight ? Math.ceil(((job.legHeight ?? 0) + gableRiseFt) / panelCoverageFt) : 0

  function makeSideOptions(max: number) {
    const opts: Array<{ label: string; value: number }> = []
    if (max < 1) return opts
    opts.push({ label: 'Single panel', value: 1 })
    opts.push({ label: '1/4 height', value: Math.max(1, Math.ceil(max * 0.25)) })
    opts.push({ label: '1/3 height', value: Math.max(1, Math.ceil(max * (1 / 3))) })
    opts.push({ label: 'Halfway', value: Math.max(1, Math.ceil(max * 0.5)) })
    // include integers 2..max
    for (let i = 2; i <= max; i++) opts.push({ label: `${i} panels`, value: i })
    opts.push({ label: 'Full height', value: max })
    // dedupe by value preserving order
    const seen = new Set<number>()
    return opts.filter(o => (seen.has(o.value) ? false : (seen.add(o.value), true)))
  }

  function makeEndOptions(max: number) {
    const opts: Array<{ label: string; value: number }> = []
    if (max < 1) return opts
    opts.push({ label: 'Gable (1 panel)', value: 1 })
    opts.push({ label: 'Extended gable (2 panels)', value: Math.min(2, max) })
    opts.push({ label: '1/3 height', value: Math.max(1, Math.ceil(max * (1 / 3))) })
    opts.push({ label: 'Halfway', value: Math.max(1, Math.ceil(max * 0.5)) })
    for (let i = 3; i <= max; i++) opts.push({ label: `${i} panels`, value: i })
    opts.push({ label: 'Fully enclosed', value: max })
    const seen = new Set<number>()
    return opts.filter(o => (seen.has(o.value) ? false : (seen.add(o.value), true)))
  }

  const sideOptions = makeSideOptions(maxCoursesSide)
  const endOptions = makeEndOptions(maxCoursesEnd)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold">Building</h2>
        <div className="min-w-[220px]">
          <label className="block text-sm">Work Order #</label>
          <Input value={job.workOrderId || ''} onChange={(e: any) => update({ workOrderId: e.target.value })} placeholder="e.g. WO-12345" />
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
        <div>
          <label className="block text-sm">Height (Leg) (ft)</label>
          <Input value={job.legHeight === undefined || job.legHeight === null ? '' : job.legHeight} onChange={(e: any) => update({ legHeight: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>

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
                {sideOptions.map(o => <option key={o.value} value={o.value}>{o.label} — {o.value} courses</option>)}
              </Select>
              <div id="leftSideHelp" className="text-xs text-muted-500">Max: {maxCoursesSide}. "Full height" uses the maximum courses (may increase material).</div>
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
                {sideOptions.map(o => <option key={o.value} value={o.value}>{o.label} — {o.value} courses</option>)}
              </Select>
              <div id="rightSideHelp" className="text-xs text-muted-500">Max: {maxCoursesSide}. "Full height" uses the maximum courses (may increase material).</div>
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
                {endOptions.map(o => <option key={o.value} value={o.value}>{o.label} — {o.value} courses</option>)}
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
                {endOptions.map(o => <option key={o.value} value={o.value}>{o.label} — {o.value} courses</option>)}
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
                          if (idx === -1) list.push(makeDefaultLeanTo(pos))
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
                    <LeanToEditor key={lt.position} leanTo={lt} onChange={(patch) => {
                      const list = [...(job.leanTos || [])]
                      list[i] = { ...list[i], ...patch }
                      update({ leanTos: list })
                    }} onRemove={() => {
                      const list = [...(job.leanTos || [])]
                      list.splice(i,1)
                      update({ leanTos: list })
                    }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <StepNav onNext={onNext} onBlank={() => setJob({ ...job, buildingType: '' })} onReset={resetBlank} />
    </div>
  )
}

function ExtraPanelsEditor({ panels, onChange }: { panels: Array<{ lengthFt?: number; qty?: number; color?: string }>; onChange: (v: any[]) => void }) {
  const [lengthText, setLengthText] = useState<string[]>(() => (panels || []).map(p => (p.lengthFt ?? '') as any as string))

  useEffect(() => {
    setLengthText(prev => (panels || []).map((p, idx) => prev[idx] ?? (p.lengthFt != null ? String(p.lengthFt) : '')))
  }, [panels])

  function parseLengthToFeet(input: string): number | undefined {
    if (!input) return undefined
    let s = String(input).trim()
    if (!s) return undefined
    s = s.replace(/[’]/g, "'")
    const ftMatch = s.match(/(-?\d+(?:\.\d+)?)\s*'/)
    const inMatch = s.match(/(-?\d+(?:\.\d+)?)\s*\"/)
    let feet = 0
    let inches = 0
    if (ftMatch) feet = parseFloat(ftMatch[1])
    if (inMatch) inches = parseFloat(inMatch[1])
    if (!ftMatch && !inMatch) {
      // try space or dash separated "ft in" like 10 6 or 10-6
      const parts = s.split(/[\s-]+/).filter(Boolean)
      if (parts.length === 2 && !parts.some(p => isNaN(Number(p)))) {
        feet = parseFloat(parts[0])
        inches = parseFloat(parts[1])
      } else if (!isNaN(Number(s))) {
        // plain number => treat as feet
        feet = parseFloat(s)
      }
    }
    const total = feet + (inches ? inches / 12 : 0)
    return isFinite(total) ? total : undefined
  }

  function updateAt(i: number, patch: any) {
    const next = [...panels]
    next[i] = { ...(next[i] || {}), ...patch }
    onChange(next)
  }
  function add() {
    onChange([...(panels || []), { lengthFt: 10, qty: 1, color: '' }])
    setLengthText(prev => [...prev, '10'])
  }
  function remove(i: number) {
    const next = panels.slice()
    next.splice(i, 1)
    onChange(next)
    setLengthText(prev => {
      const arr = prev.slice()
      arr.splice(i, 1)
      return arr
    })
  }
  return (
    <div className="space-y-2">
      {(panels || []).map((p, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs">Qty</label>
            <Input value={p.qty ?? ''} onChange={(e: any) => updateAt(i, { qty: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Qty" />
          </div>
          <div>
            <label className="block text-xs">Length</label>
            <Input value={lengthText[i] ?? (p.lengthFt ?? '')} onChange={(e: any) => {
              const txt = e.target.value
              setLengthText(prev => {
                const arr = prev.slice()
                arr[i] = txt
                return arr
              })
              const feet = parseLengthToFeet(txt)
              updateAt(i, { lengthFt: txt === '' ? undefined : feet })
            }} placeholder={'e.g. 10\' 6"'} />
          </div>
          <div>
            <label className="block text-xs">Color</label>
            <Select value={p.color || ''} onChange={(e: any) => updateAt(i, { color: e.target.value })}>
              <option value="">—</option>
              <option value="Galvalume">Galvalume</option>
              <option value="White">White</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Tan">Tan</option>
              <option value="Green">Green</option>
            </Select>
          </div>
          <div className="col-span-3 text-right">
            <button type="button" className="text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.08)]" onClick={() => remove(i)}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="text-xs px-2 py-1 rounded bg-primary-500 text-white" onClick={add}>Add Extra Panel</button>
    </div>
  )
}

function OpeningsEditor({ openings, buildingWidth, onChange }: { openings: Array<{ type: 'walk' | 'window' | 'rollup'; widthFt?: number; side?: 'end' | 'side' }>; buildingWidth: number; onChange: (v: any[]) => void }) {
  function updateAt(i: number, patch: any) {
    const next = [...(openings||[])]
    next[i] = { ...(next[i] || {}), ...patch }
    onChange(next)
  }
  function add() {
    onChange([...(openings||[]), { type: 'walk', widthFt: 3, side: 'side' }])
  }
  function remove(i: number) {
    const next = openings.slice()
    next.splice(i, 1)
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {(openings||[]).map((o, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <Select value={o.type} onChange={(e: any) => updateAt(i, { type: e.target.value })}>
            <option value="walk">Walk-in Door</option>
            <option value="window">Window</option>
            <option value="rollup">Roll-up Door</option>
          </Select>
          <Input value={o.widthFt ?? ''} onChange={(e: any) => updateAt(i, { widthFt: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Width (ft)" />
          <Select value={o.side || 'side'} onChange={(e: any) => updateAt(i, { side: e.target.value })}>
            <option value="side">Side</option>
            <option value="end">End</option>
          </Select>
          <div className="col-span-3 text-right">
            <button type="button" className="text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.08)]" onClick={() => remove(i)}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="text-xs px-2 py-1 rounded bg-primary-500 text-white" onClick={add}>Add Opening</button>
    </div>
  )
}

function LeanToEditor({ leanTo, onChange, onRemove }: { leanTo: any; onChange: (patch: any) => void; onRemove: () => void }) {
  const update = (patch: any) => onChange(patch)
  const roofStyle = leanTo.roofStyle || (leanTo.roofOrientation ? (leanTo.roofOrientation === 'vertical' ? 'a_frame_vertical' : 'a_frame_horizontal') : '')
  // compute basics for horizontal panel UI reuse
  const coverage = 3
  const sideMax = Math.ceil((leanTo.legHeight || 0) / coverage)
  const gableRise = ((leanTo.pitch || 0) / 12) * ((leanTo.width || 0) / 2)
  const endMax = Math.ceil(((leanTo.legHeight || 0) + gableRise) / coverage)
  const sideOptions = Array.from({ length: Math.max(0, sideMax) }, (_, idx) => idx + 1)
  const endOptions = Array.from({ length: Math.max(0, endMax) }, (_, idx) => idx + 1)
  return (
    <div className="p-3 rounded border border-[rgba(255,255,255,0.08)]">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm">{leanTo.position[0].toUpperCase()+leanTo.position.slice(1)} Lean-to</div>
        <button type="button" className="text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.08)]" onClick={onRemove}>Remove</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs">Width (ft)</label>
          <Input value={leanTo.width ?? ''} onChange={(e: any) => update({ width: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs">Length (ft)</label>
          <Input value={leanTo.length ?? ''} onChange={(e: any) => update({ length: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs">Height (Leg) (ft)</label>
          <Input value={leanTo.legHeight ?? ''} onChange={(e: any) => update({ legHeight: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs">Pitch</label>
          <Select value={leanTo.pitch ?? ''} onChange={(e: any) => update({ pitch: e.target.value === '' ? undefined : Number(e.target.value) })}>
            <option value="">—</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs">Roof Style</label>
          <Select value={roofStyle} onChange={(e: any) => {
            const v = e.target.value
            let orientation: 'vertical' | 'horizontal' | '' = ''
            if (v === 'standard') orientation = 'horizontal'
            if (v === 'a_frame_horizontal') orientation = 'horizontal'
            if (v === 'a_frame_vertical') orientation = 'vertical'
            update({ roofStyle: v, roofOrientation: orientation || leanTo.roofOrientation })
          }}>
            <option value="">—</option>
            <option value="standard">Standard</option>
            <option value="a_frame_horizontal">A Frame (Horizontal)</option>
            <option value="a_frame_vertical">A Frame (Vertical)</option>
          </Select>
        </div>
        <div>
          <label className="block text-xs">Spacing</label>
          <Input value={leanTo.spacing ?? ''} onChange={(e: any) => update({ spacing: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>

        <div>
          <label className="block text-xs">Roof Color</label>
          <Select value={leanTo.panelColorRoof || ''} onChange={(e: any) => update({ panelColorRoof: e.target.value })}>
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
          <label className="block text-xs">Sides & Ends Color</label>
          <Select value={leanTo.panelColorSide || ''} onChange={(e: any) => update({ panelColorSide: e.target.value, panelColorEnd: e.target.value })}>
            <option value="">—</option>
            <option value="Galvalume">Galvalume</option>
            <option value="White">White</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Tan">Tan</option>
            <option value="Green">Green</option>
          </Select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs">Wall Enclosure</label>
          <Select value={leanTo.wallOrientation || ''} onChange={(e: any) => {
            const val = e.target.value
            const cap = val ? (val[0].toUpperCase()+val.slice(1)) : ''
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
            update(patch)
          }}>
            <option value="">—</option>
            <option value="open">Open</option>
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </Select>
        </div>

        {leanTo.wallOrientation === 'horizontal' && (
          <>
            <div>
              <label className="block text-xs">Left Side Courses</label>
              <Select value={leanTo.leftSideCourses ?? ''} onChange={(e: any) => update({ leftSideCourses: e.target.value === '' ? undefined : Math.max(1, Math.min(sideMax, Number(e.target.value))) })}>
                <option value="">Full height (max)</option>
                {sideOptions.map((v: number) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs">Right Side Courses</label>
              <Select value={leanTo.rightSideCourses ?? ''} onChange={(e: any) => update({ rightSideCourses: e.target.value === '' ? undefined : Math.max(1, Math.min(sideMax, Number(e.target.value))) })}>
                <option value="">Full height (max)</option>
                {sideOptions.map((v: number) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs">Front End Courses</label>
              <Select value={leanTo.frontEndCourses ?? ''} onChange={(e: any) => update({ frontEndCourses: e.target.value === '' ? undefined : Math.max(1, Math.min(endMax, Number(e.target.value))) })}>
                <option value="">Full height (fully enclosed)</option>
                {endOptions.map((v: number) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs">Back End Courses</label>
              <Select value={leanTo.backEndCourses ?? ''} onChange={(e: any) => update({ backEndCourses: e.target.value === '' ? undefined : Math.max(1, Math.min(endMax, Number(e.target.value))) })}>
                <option value="">Full height (fully enclosed)</option>
                {endOptions.map((v: number) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs">Has Wainscot</label>
          <label className="inline-flex items-center gap-2 text-xs mt-1">
            <input type="checkbox" checked={leanTo.wallPanelMode === 'wainscot'} onChange={(e: any) => update({ wallPanelMode: e.target.checked ? 'wainscot' : 'full' })} />
            <span>Enable</span>
          </label>
        </div>
        {leanTo.wallPanelMode === 'wainscot' && (
          <div>
            <label className="block text-xs">Wainscot Color</label>
            <Select value={leanTo.wainscotColor || ''} onChange={(e: any) => update({ wainscotColor: e.target.value })}>
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

        <div className="col-span-2">
          <label className="block text-xs">Extra Panels</label>
          <ExtraPanelsEditor panels={leanTo.extraPanels || []} onChange={(list) => update({ extraPanels: list })} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs">Openings</label>
          <OpeningsEditor openings={leanTo.openings || []} buildingWidth={leanTo.width || 0} onChange={(list) => update({ openings: list })} />
        </div>
      </div>
    </div>
  )
}
