import { jsPDF } from 'jspdf'

export function exportPdf(title: string, lines: string[], filename = 'bom.pdf') {
  const doc = new jsPDF()
  doc.setFontSize(12)
  doc.text(title, 10, 10)
  let y = 20
  for (const l of lines) {
    doc.text(l, 10, y)
    y += 8
    if (y > 280) {
      doc.addPage()
      y = 20
    }
  }
  doc.save(filename)
}
