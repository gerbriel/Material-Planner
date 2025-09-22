export function formatFeetToFtIn(feetDecimal: number) {
  const totalInches = Math.round(feetDecimal * 12)
  const ft = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return `${ft}' ${inches}\"`
}

export default formatFeetToFtIn

// Parse a length expressed as feet/inches into a decimal feet number.
// Accepts inputs like:
//  - 12 (feet as number)
//  - "12.5" (feet decimal)
//  - "12' 6\""
//  - "12ft 6in"
//  - "150\"" (inches)
//  - "12-6" or "12 6" (feet-inches)
export function parseFtInToFeet(input: string | number | null | undefined): number | undefined {
  if (input === null || input === undefined) return undefined
  if (typeof input === 'number' && !Number.isNaN(input)) return input
  if (typeof input !== 'string') return undefined

  const s = input.trim()
  if (!s) return undefined

  // Quick cases: pure number string => feet decimal
  const num = Number(s)
  if (!Number.isNaN(num)) return num

  // Normalize common symbols/words
  let str = s
    .replace(/\s+/g, ' ')
    .replace(/feet|foot|ft/gi, "'")
    .replace(/inches|inch|in/gi, '"')
    .trim()

  // Pattern 1: X' Y"  (feet and inches, inches may be decimal)
  const reFtIn = /(-?\d+(?:\.\d+)?)\s*'\s*(\d+(?:\.\d+)?)\s*"?$/
  const m1 = str.match(reFtIn)
  if (m1) {
    const ft = parseFloat(m1[1])
    const inches = parseFloat(m1[2])
    if (!Number.isNaN(ft) && !Number.isNaN(inches)) return ft + inches / 12
  }

  // Pattern 2: X' only
  const reFtOnly = /(-?\d+(?:\.\d+)?)\s*'$/
  const m2 = str.match(reFtOnly)
  if (m2) {
    const ft = parseFloat(m2[1])
    if (!Number.isNaN(ft)) return ft
  }

  // Pattern 3: Y" only (inches)
  const reInOnly = /(-?\d+(?:\.\d+)?)\s*"$/
  const m3 = str.match(reInOnly)
  if (m3) {
    const inches = parseFloat(m3[1])
    if (!Number.isNaN(inches)) return inches / 12
  }

  // Pattern 4: two numbers separated by space or hyphen (feet-inches)
  const m4 = str.match(/^(-?\d+(?:\.\d+)?)\s*[- ]\s*(\d+(?:\.\d+)?)$/)
  if (m4) {
    const ft = parseFloat(m4[1])
    const inches = parseFloat(m4[2])
    if (!Number.isNaN(ft) && !Number.isNaN(inches)) return ft + inches / 12
  }

  // Pattern 5: ends with '" without space (e.g., 12'6")
  const m5 = str.match(/^(-?\d+(?:\.\d+)?)'(\d+(?:\.\d+)?)"$/)
  if (m5) {
    const ft = parseFloat(m5[1])
    const inches = parseFloat(m5[2])
    if (!Number.isNaN(ft) && !Number.isNaN(inches)) return ft + inches / 12
  }

  // Fallback: strip non-numeric except . and try parseFloat (assume feet)
  const fallback = parseFloat(str.replace(/[^0-9.\-]/g, ''))
  return Number.isNaN(fallback) ? undefined : fallback
}
