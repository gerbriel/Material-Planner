import { jsPDF } from 'jspdf'
import { formatFeetToFtIn } from '../format/length'

export function exportBomPdf(title: string, bom: any[], filename = 'bom.pdf', includeCategories: string[] = []) {
  const doc = new jsPDF()
  let y = 24
  let col = 0 // 0 = left, 1 = right
  const leftX = 10
  const rightX = 110
  const colWidth = 90
  const pageHeader = (page: number) => {
    doc.setFontSize(14)
    doc.text(title, leftX, 12)
    doc.setFontSize(9)
    doc.text(`Page ${page}`, 180, 12)
    y = 24
    col = 0
  }
  pageHeader(1)

  // group by category
  const grouped: Record<string, any[]> = {}
  for (const r of bom) {
    if (includeCategories.length && !includeCategories.includes(r.category)) continue
    grouped[r.category] = grouped[r.category] || []
    grouped[r.category].push(r)
  }

  for (const cat of Object.keys(grouped)) {
    doc.setFontSize(12)
    const x = col === 0 ? leftX : rightX
    doc.text(cat, x, y)
    y += 8
    doc.setFontSize(10)
    for (const row of grouped[cat]) {
  const pieces = typeof row.piecesPerSide === 'number' ? `${row.piecesPerSide} per side` : ''
  const formattedLen = row.pieceLengthDisplay || (typeof row.pieceLengthFt === 'number' ? formatFeetToFtIn(row.pieceLengthFt) : (row.length ? formatFeetToFtIn(row.length) : ''))
  const noteParts = []
  if (pieces) noteParts.push(pieces)
  if (formattedLen) noteParts.push(formattedLen)
  if (row.notes) noteParts.push(row.notes)
  const notes = noteParts.length ? `(${noteParts.join('; ')})` : ''
  const line = `${row.item} — ${row.qty} ${row.unit || 'ea'} ${notes}`
      doc.text(line, x + 2, y)
      y += 6
      if (y > 260) {
        // move to next column or page
        if (col === 0) {
          col = 1
          y = 24
        } else {
          doc.addPage()
          pageHeader(doc.getNumberOfPages())
        }
      }
    }
    // after category block, add spacing
    y += 6
    if (y > 260) {
      if (col === 0) { col = 1; y = 24 } else { doc.addPage(); pageHeader(doc.getNumberOfPages()) }
    }
  }

  // add final page numbers footer
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.text(`Page ${p} of ${total}`, 10, 285)
  }

  doc.save(filename)
}
