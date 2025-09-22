import React from 'react'
import { useAtom } from 'jotai'
import { jobAtom } from '../../state/atoms'

export default function StepTrimAnchors() {
  const [job, setJob] = useAtom(jobAtom)

  const update = (patch: any) => setJob({ ...(job || {}), trim: { ...(job.trim || {}), ...patch } })

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Trim & Anchors</h2>
      <p className="text-sm text-muted-500">Trim selections, closure strips, and anchor type.</p>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <div className="text-sm mb-1">Closure Strip</div>
          <select className="w-full p-2 rounded border" value={job.trim?.closure || 'none'} onChange={(e) => update({ closure: e.target.value })}>
            <option value="none">None</option>
            <option value="foam">Foam</option>
            <option value="strip">Closure Strip</option>
          </select>
        </label>

        <label className="block">
          <div className="text-sm mb-1">Anchor Type</div>
          <select className="w-full p-2 rounded border" value={job.trim?.anchorType || 'bolt'} onChange={(e) => update({ anchorType: e.target.value })}>
            <option value="bolt">Bolt</option>
            <option value="asphalt_kit">Asphalt Kit</option>
            <option value="screw">Screw</option>
          </select>
        </label>
      </div>
    </div>
  )
}
