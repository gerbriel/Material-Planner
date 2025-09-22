export function countRoofScrews(sheetCount: number, supportsPerSheet: number) {
  const total = sheetCount * supportsPerSheet * 5
  const bags = Math.ceil(total / 250)
  return { total, bags }
}

export function countTrimScrews(totalLF: number, supportsPerLF: number) {
  const contacts = totalLF * supportsPerLF
  const total = Math.ceil(contacts * 3)
  const bags = Math.ceil(total / 250)
  return { total, bags }
}

/**
 * Derive the number of support lines per panel (supports per sheet) based on gauge and profile.
 * Assumptions:
 * - Lower gauge numbers are thicker/heavier material and require fewer supports.
 * - Typical mapping used here is a simple rule-of-thumb and should be refined by profile/spans.
 */
export function deriveSupportsPerSheet(gauge: number, profile: 'rib' | 'corrugated' | 'flat' = 'rib', spanFt = 10) {
  // Simple heuristic:
  // gauge <=16 -> heavy -> 6 supports
  // 17-22 -> medium -> 8 supports
  // >=23 -> light -> 10 supports
  if (gauge <= 16) return 6
  if (gauge <= 22) return 8
  return 10
}

/**
 * Convenience: count roof screws given a gauge/profile by deriving supports per sheet.
 */
export function countRoofScrewsByGauge(sheetCount: number, gauge: number, profile: 'rib' | 'corrugated' | 'flat' = 'rib', spanFt = 10) {
  const supports = deriveSupportsPerSheet(gauge, profile, spanFt)
  return countRoofScrews(sheetCount, supports)
}
