import React from 'react'
import { useAtom } from 'jotai'
import { jobAtom } from '../../state/atoms'
import ColumnResizerTable from '../ui/ColumnResizerTable'
import LiveSummary from '../layout/LiveSummary'
import { buildSimpleBom } from '../../lib/bom/generator'
import { formatFeetToFtIn } from '../../lib/format/length'

export default function StepReview() {
  const [job] = useAtom(jobAtom)
  // BOM filters removed — show all categories
  const bom = buildSimpleBom(job)

  const grouped = bom.reduce((acc: Record<string, any[]>, row: any) => {
    acc[row.category] = acc[row.category] || []
    acc[row.category].push(row)
    return acc
  }, {})

  return (
    <div>
      <h2 className="text-xl font-semibold">Review & BOM</h2>
      <p className="text-sm text-muted-500">Preliminary only. Engineering may change counts; final BOM subject to stamped plans.</p>

      <div className="mt-4 card">
        <h3 className="font-semibold">Summary</h3>
        <div className="text-sm mt-2">{job.buildingType} — {job.width}ft × {job.length}ft</div>
        <div className="text-xs mt-2 text-muted-500">Work Order: {job.workOrderId || '—'}</div>
      </div>
      {/* BOM Filters removed — showing complete BOM */}

      <div className="mt-4">
        {Object.keys(grouped).map((cat) => (
          <div key={cat} className="card mt-3">
            <h4 className="font-semibold">{cat}</h4>
            {/* Use the ColumnResizerTable to provide a resizable first column */}
            <ColumnResizerTable>
              {grouped[cat].map((r: any, i: number) => {
                // determine length: prefer r.length or r.pieceLengthFt
                let lengthDisplay = ''
                let lengthVal: number | undefined = undefined
                if (typeof r.pieceLengthFt === 'number') lengthVal = r.pieceLengthFt
                else if (typeof r.length === 'number') lengthVal = r.length
                if (typeof lengthVal === 'number') lengthDisplay = formatFeetToFtIn(lengthVal)

                const color = r.panelColor || ''

                // nicer label for panels: show Side/End when sideOrEnd provided
                if (r.sideOrEnd === 'side' || r.sideOrEnd === 'end') {
                  const which = r.sideOrEnd === 'side' ? 'Side Panels' : 'End Panels'
                  const spacingVal = typeof r.pieceLengthFt === 'number' ? r.pieceLengthFt : (typeof r.length === 'number' ? r.length : undefined)
                  const lengthText = typeof spacingVal === 'number' ? formatFeetToFtIn(spacingVal) : lengthDisplay
                  return (
                    <tr key={i}>
                      <td>{which}</td>
                      <td>{r.qty}</td>
                      <td>{lengthText}</td>
                      <td>{color ? <span className="inline-flex items-center gap-2"><span style={{width:12,height:12,background:color,display:'inline-block',borderRadius:2,border:'1px solid rgba(0,0,0,0.1)'}}></span><span className="text-xs">{color}</span></span> : '—'}</td>
                      <td>{r.unit || 'ea'}</td>
                      <td>{r.notes || ''}</td>
                    </tr>
                  )
                }
                const label = r.item
                return (
                  <tr key={i}>
                    <td>{label}</td>
                    <td>{r.qty}</td>
                    <td>{lengthDisplay}</td>
                    <td>{color ? <span className="inline-flex items-center gap-2"><span style={{width:12,height:12,background:color,display:'inline-block',borderRadius:2,border:'1px solid rgba(0,0,0,0.1)'}}></span><span className="text-xs">{color}</span></span> : '—'}</td>
                    <td>{r.unit || 'ea'}</td>
                    <td>{r.notes || ''}</td>
                  </tr>
                )
              })}
            </ColumnResizerTable>
          </div>
        ))}
      </div>
    </div>
  )
}
