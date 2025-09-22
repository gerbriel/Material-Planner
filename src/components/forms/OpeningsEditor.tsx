import React from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function OpeningsEditor({ openings, buildingWidth, onChange }: { openings: Array<{ type: 'walk' | 'window' | 'rollup'; widthFt?: number; side?: 'end' | 'side' }>; buildingWidth: number; onChange: (v: any[]) => void }) {
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
