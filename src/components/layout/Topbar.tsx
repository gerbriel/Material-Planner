import React from 'react'
import DarkModeToggle from './DarkModeToggle'
import { useAtom } from 'jotai'
import { stepAtom, jobAtom } from '../../state/atoms'
import { exportCsv } from '../../lib/export/exportCsv'
import { exportBomPdf } from '../../lib/export/exportBomPdf'
import { buildSimpleBom } from '../../lib/bom/generator'
import { mainWidthAtom, rightColWidthAtom, asideHeightAtom, stackedAtom, layoutOrderAtom as layoutOrderAtomLocal } from '../../state/atoms'
import { useSetAtom } from 'jotai'
// BOM filters removed from state

export default function Topbar() {
  const [step, setStep] = useAtom(stepAtom)
  const [job, setJob] = useAtom(jobAtom)
  // no bomFilter
  const [mainWidth] = useAtom(mainWidthAtom)
  const [rightWidth] = useAtom(rightColWidthAtom)
  const [asideHeight] = useAtom(asideHeightAtom)
  const [stacked] = useAtom(stackedAtom)
  const [layoutOrder] = useAtom(layoutOrderAtomLocal)
  const setMainWidth = useSetAtom(mainWidthAtom)
  const setRightWidth = useSetAtom(rightColWidthAtom)
  const setAsideHeight = useSetAtom(asideHeightAtom)
  const setStacked = useSetAtom(stackedAtom)
  const setLayoutOrder = useSetAtom(layoutOrderAtomLocal)

  // removed layout save/load/delete UI


  const onExportCsv = () => {
    const rows = buildSimpleBom(job)
    exportCsv(rows, `bom-${job.buildingType}.csv`)
  }

  const onExportPdf = () => {
    const rows = buildSimpleBom(job)
    exportBomPdf('Picking Ticket', rows, `bom-${job.buildingType}.pdf`)
  }

  const canExport = step === 6 // enable only on Review step

  // layout save/load/delete removed

  return (
    <header className="w-full border-b border-border bg-card-dark">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4 w-full">
          <h1 className="text-lg font-semibold">Material List Builder</h1>

          <div className="ml-6 flex items-center gap-3">
            <button className={`px-3 py-2 rounded ${step === 1 ? 'bg-slate-700 font-semibold' : 'hover:bg-slate-700'}`} onClick={() => setStep(1)}>1. Building</button>
            <button className={`px-3 py-2 rounded ${step === 2 ? 'bg-slate-700 font-semibold' : 'hover:bg-slate-700'}`} onClick={() => setStep(2)}>2. Review</button>

          </div>

            <div className="ml-auto flex items-center gap-3">
            <button className="px-3 py-1 rounded bg-primary-500 text-white text-sm" onClick={onExportCsv} disabled={!canExport}>Export CSV</button>
            <button className="px-3 py-1 rounded bg-primary-500 text-white text-sm" onClick={onExportPdf} disabled={!canExport}>Export PDF</button>
            <a href="/theme-preview" className="text-sm px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.02)]">Theme</a>
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
