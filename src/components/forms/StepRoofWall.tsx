import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { jobAtom } from '../../state/atoms'
import StepNav from '../ui/StepNav'
import { jobSchema } from '../../state/schema'

export default function StepRoofWall() {
  const [job, setJob] = useAtom(jobAtom)
  const [errors, setErrors] = useState<string | null>(null)

  const update = (patch: any) => setJob({ ...job, ...patch })

  const onNext = () => {
    const result = jobSchema.safeParse(job)
    if (!result.success) {
      setErrors(result.error.errors.map((e) => e.message).join(', '))
      return
    }
    setErrors(null)
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Roof & Walls</h2>
      {errors && <div className="text-red-400">{errors}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label>
          Wall Orientation
          <select value={job.wallOrientation} onChange={(e) => update({ wallOrientation: e.target.value })} className="w-full p-2 rounded border border-border bg-transparent">
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
            <option value="open">Open</option>
          </select>
        </label>
        <label>
          Wall Panel Mode (3' modular)
          <select value={job.wallPanelMode || 'full'} onChange={(e) => update({ wallPanelMode: e.target.value })} className="w-full p-2 rounded border border-border bg-transparent">
            <option value="full">Full height</option>
            <option value="wainscot">Wainscot</option>
            <option value="strips">Strips (3' modules)</option>
          </select>
        </label>

        <label>
          Roof Panel Color
          <input className="w-full p-2 rounded border" value={job.panelColorRoof || ''} onChange={(e) => update({ panelColorRoof: e.target.value })} />
        </label>

        <label>
          Side Wall Panel Color
          <input className="w-full p-2 rounded border" value={job.panelColorSide || ''} onChange={(e) => update({ panelColorSide: e.target.value })} />
        </label>

        <label>
          End Wall Panel Color
          <input className="w-full p-2 rounded border" value={job.panelColorEnd || ''} onChange={(e) => update({ panelColorEnd: e.target.value })} />
        </label>
      </div>
      <StepNav onNext={onNext} />
    </div>
  )
}
