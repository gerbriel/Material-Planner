import React from 'react'
import { useAtom } from 'jotai'
import { jobAtom } from '../../state/atoms'
import NumberInput from '../ui/NumberInput'

export default function StepGeometry() {
  const [job, setJob] = useAtom(jobAtom)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Geometry</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm">Width (ft)</label>
          <NumberInput value={job.width} onChange={(v: number) => setJob({ ...job, width: v })} />
        </div>
        <div>
          <label className="block text-sm">Length (ft)</label>
          <NumberInput value={job.length} onChange={(v: number) => setJob({ ...job, length: v })} />
        </div>
        <div>
          <label className="block text-sm">Leg Height (ft)</label>
          <NumberInput value={job.legHeight} onChange={(v: number) => setJob({ ...job, legHeight: v })} />
        </div>
        <div>
          <label className="block text-sm">Roof Pitch</label>
          <select value={job.pitch} onChange={(e: any) => setJob({ ...job, pitch: Number(e.target.value) })} className="w-full p-2 rounded border border-border bg-transparent">
            <option value={2}>2/12</option>
            <option value={3}>3/12</option>
            <option value={4}>4/12</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Truss Spacing (ft)</label>
          <NumberInput value={job.spacing} onChange={(v: number) => setJob({ ...job, spacing: v })} />
        </div>
      </div>
    </div>
  )
}
