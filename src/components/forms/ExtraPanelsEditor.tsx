import React, { useEffect, useState } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function ExtraPanelsEditor({ panels, onChange }: { panels: Array<{ lengthFt?: number; qty?: number; color?: string }>; onChange: (v: any[]) => void }) {
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
      const parts = s.split(/[\s-]+/).filter(Boolean)
      if (parts.length === 2 && !parts.some(p => isNaN(Number(p)))) {
        feet = parseFloat(parts[0])
        inches = parseFloat(parts[1])
      } else if (!isNaN(Number(s))) {
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
            }} placeholder={"e.g. 10' 6\""} />
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
