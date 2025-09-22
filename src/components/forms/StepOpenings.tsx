import React from 'react'
import { useAtom } from 'jotai'
import { jobAtom } from '../../state/atoms'

export default function StepOpenings() {
  const [job, setJob] = useAtom(jobAtom)

  const add = (type: 'walk' | 'window' | 'rollup') => {
    const item: any = { type }
    if (type === 'window' || type === 'rollup') item.widthFt = 4
    const next = { ...(job || {}), openings: [...(job.openings || [] as any[]), item] }
    setJob(next)
  }

  const removeAt = (idx: number) => {
    const arr = [...(job.openings || [])]
    arr.splice(idx, 1)
    setJob({ ...(job || {}), openings: arr })
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Openings</h2>
      <p className="text-sm text-muted-500">Add openings (roll-ups, walk doors, windows).</p>

      <div className="mt-3 flex gap-2">
        <button className="px-2 py-1 rounded border" onClick={() => add('walk')}>Add Walk Door</button>
        <button className="px-2 py-1 rounded border" onClick={() => add('window')}>Add Window</button>
        <button className="px-2 py-1 rounded border" onClick={() => add('rollup')}>Add Rollup</button>
      </div>

      <div className="mt-4 space-y-2">
        {((job.openings || []) as { type: 'walk' | 'window' | 'rollup'; widthFt?: number; side?: 'end' | 'side' }[]).map((o, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded border">
            <div className="text-sm flex items-center gap-3">
              <div className="capitalize">{o.type}</div>
              {(o.type === 'window' || o.type === 'rollup') && (
                <input className="w-20 p-1 rounded border" value={o.widthFt} onChange={(e) => {
                  const arr = [...(job.openings || [])]
                  arr[i] = { ...arr[i], widthFt: Number(e.target.value) || 0 }
                  setJob({ ...(job || {}), openings: arr })
                }} />
              )}
              <select className="p-1 rounded border" value={o.side || 'end'} onChange={(e) => {
                const arr = [...(job.openings || [])]
                arr[i] = { ...arr[i], side: e.target.value as any }
                setJob({ ...(job || {}), openings: arr })
              }}>
                <option value="end">End</option>
                <option value="side">Side</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 text-sm rounded bg-rose-50" onClick={() => removeAt(i)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
