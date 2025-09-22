import React from 'react'
import { useAtom } from 'jotai'
import { jobAtom } from '../../state/atoms'
import ColumnResizerTable from '../ui/ColumnResizerTable'
import LiveSummary from '../layout/LiveSummary'
import { buildSimpleBom } from '../../lib/bom/generator'
import { formatFeetToFtIn, parseFtInToFeet } from '../../lib/format/length'

export default function StepReview() {
  const [job] = useAtom(jobAtom)
  // BOM filters removed — show all categories
  const bom = buildSimpleBom(job)

  // Consolidate Panels and Trim by same length and color. Keep other categories as-is.
  type BomRow = any
  const grouped = bom.reduce((acc: Record<string, BomRow[]>, row: BomRow) => {
    // Determine if row should be consolidated as Panels or Trim
    const isPanelish = (row.category === 'Walls' || row.category === 'Roof' || row.category === 'Panels') && (row.unit === 'sheet' || row.unit === 'pcs')
    const isTrim = row.category === 'Trim' && (row.unit === 'pcs' || row.length)
    const targetCat = isPanelish ? 'Panels' : isTrim ? 'Trim' : row.category

    acc[targetCat] = acc[targetCat] || []
    if (isPanelish) {
      const color = row.panelColor || ''
      const lenFt = typeof row.pieceLengthFt === 'number' ? row.pieceLengthFt
        : typeof row.length === 'number' ? row.length
        : parseFtInToFeet(row.length)
      const unit = row.unit || 'sheet'
      const existing = (acc[targetCat] as BomRow[]).find(r => (
        (r.panelColor || '') === color &&
        ((typeof r.pieceLengthFt === 'number' ? r.pieceLengthFt : (typeof r.length === 'number' ? r.length : parseFtInToFeet(r.length))) === lenFt) &&
        (r.unit || '') === unit
      ))
      if (existing) {
        existing.qty += row.qty || 0
      } else {
        acc[targetCat].push({ ...row, item: targetCat, panelColor: color, pieceLengthFt: lenFt ?? row.pieceLengthFt, unit })
      }
      return acc
    }
    if (isTrim) {
      const color = row.panelColor || ''
      const lenFt = typeof row.pieceLengthFt === 'number' ? row.pieceLengthFt
        : typeof row.length === 'number' ? row.length
        : parseFtInToFeet(row.length)
      const unit = row.unit || 'pcs'
      const existing = (acc[targetCat] as BomRow[]).find(r => (
        r.item === row.item &&
        (r.panelColor || '') === color &&
        ((typeof r.pieceLengthFt === 'number' ? r.pieceLengthFt : (typeof r.length === 'number' ? r.length : parseFtInToFeet(r.length))) === lenFt) &&
        (r.unit || '') === unit
      ))
      if (existing) {
        existing.qty += row.qty || 0
      } else {
        // Preserve the trim type label (Eave, Rake, Gable, etc.)
        acc[targetCat].push({ ...row, panelColor: color, pieceLengthFt: lenFt ?? row.pieceLengthFt, unit })
      }
      return acc
    }
    // Non-panel/trim rows remain as-is under their original category
    acc[targetCat].push(row)
    return acc
  }, {} as Record<string, BomRow[]>)

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
                else if (typeof r.length === 'string') lengthVal = parseFtInToFeet(r.length)
                if (typeof lengthVal === 'number') lengthDisplay = formatFeetToFtIn(lengthVal)

                const color = r.panelColor || ''

                // Simplified label for consolidated categories
                const label = r.item || cat
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
