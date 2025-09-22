import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { bomToCsvRows } from './bomCsvHelper'

export function exportCsv(bom: any[], filename = 'bom.csv', includeCategories: string[] = []) {
  // includeCategories optional; if empty, bomToCsvRows will return full set
  const rows = bomToCsvRows(bom, includeCategories)
  // enforce column order for CSV consumers
  const ordered = rows.map((r: any) => ({
    category: r.category,
    item: r.item,
    description: r.description,
    qty: r.qty,
    unit: r.unit,
    piecesPerSide: r.piecesPerSide,
    pieceLengthFt: r.pieceLengthFt,
    color: r.color,
    notes: r.notes
  }))
  const csv = Papa.unparse(ordered)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, filename)
}
