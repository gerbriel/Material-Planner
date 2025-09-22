import React from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import ExtraPanelsEditor from './ExtraPanelsEditor'
import OpeningsEditor from './OpeningsEditor'

export default function LeanToEditor({ leanTo, onChange, onRemove }: { leanTo: any; onChange: (patch: any) => void; onRemove?: () => void }) {
  const update = (patch: any) => onChange(patch)
  const roofStyle = leanTo.roofStyle || (leanTo.roofOrientation ? (leanTo.roofOrientation === 'vertical' ? 'a_frame_vertical' : 'a_frame_horizontal') : '')
  // compute basics for horizontal panel UI reuse
  const coverage = 3
  const baseHeight = (leanTo.lowSideHeight || 0)
  const sideMax = Math.ceil((baseHeight || 0) / coverage)
  const gableRise = ((leanTo.pitch || 0) / 12) * ((leanTo.width || 0) / 2)
  const endMax = Math.ceil(((baseHeight || 0) + gableRise) / coverage)
  const sideOptions = Array.from({ length: Math.max(0, sideMax) }, (_, idx) => idx + 1)
  const endOptions = Array.from({ length: Math.max(0, endMax) }, (_, idx) => idx + 1)
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm">{leanTo.position ? (leanTo.position[0].toUpperCase()+leanTo.position.slice(1)) : 'Lean-to'} Editor</div>
        {onRemove && (
          <button type="button" className="text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.08)]" onClick={onRemove}>Remove</button>
        )}
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
          <label className="block text-xs">High Side Height (ft)</label>
          <Input value={leanTo.highSideHeight ?? ''} onChange={(e: any) => update({ highSideHeight: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs">Low Side Height (ft)</label>
          <Input value={leanTo.lowSideHeight ?? ''} onChange={(e: any) => update({ lowSideHeight: e.target.value === '' ? undefined : Number(e.target.value) })} />
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
              <label className="block text-xs">Left Side Panels</label>
              <Select value={leanTo.leftSideCourses ?? ''} onChange={(e: any) => update({ leftSideCourses: e.target.value === '' ? undefined : Math.max(1, Math.min(sideMax, Number(e.target.value))) })}>
                <option value="">Full height (max)</option>
                {sideOptions.map((v: number) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs">Right Side Panels</label>
              <Select value={leanTo.rightSideCourses ?? ''} onChange={(e: any) => update({ rightSideCourses: e.target.value === '' ? undefined : Math.max(1, Math.min(sideMax, Number(e.target.value))) })}>
                <option value="">Full height (max)</option>
                {sideOptions.map((v: number) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs">Front End Panels</label>
              <Select value={leanTo.frontEndCourses ?? ''} onChange={(e: any) => update({ frontEndCourses: e.target.value === '' ? undefined : Math.max(1, Math.min(endMax, Number(e.target.value))) })}>
                <option value="">Full height (fully enclosed)</option>
                {endOptions.map((v: number) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs">Back End Panels</label>
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
