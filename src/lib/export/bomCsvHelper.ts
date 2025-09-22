import { formatFeetToFtIn } from '../format/length'

export function bomToCsvRows(bom: any[], includeCategories: string[] = []) {
  const rows = includeCategories && includeCategories.length ? bom.filter((r) => includeCategories.includes(r.category)) : bom
  // normalize fields for CSV consumers
  return rows.map((r) => {
    return {
      category: r.category,
      item: r.item,
      description: r.description || '',
      qty: typeof r.qty === 'number' ? r.qty : Number(r.qty) || 0,
      unit: r.unit || 'ea',
      piecesPerSide: typeof r.piecesPerSide === 'number' ? r.piecesPerSide : (r.piecesPerSide ? Number(r.piecesPerSide) : ''),
      pieceLengthFt: typeof r.pieceLengthFt === 'number' ? r.pieceLengthFt : (r.length && typeof r.length === 'number' ? r.length : ''),
      pieceLengthDisplay: (typeof r.pieceLengthFt === 'number') ? formatFeetToFtIn(r.pieceLengthFt) : (r.length && typeof r.length === 'number' ? formatFeetToFtIn(r.length) : ''),
        color: r.panelColor || (r.notes ? (() => {
        const m = (r.notes as string).match(/color:([^;]+)/)
        return m ? m[1] : ''
      })() : ''),
      notes: r.notes || ''
    }
  })
}
