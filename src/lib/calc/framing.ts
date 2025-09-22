/**
 * framing.ts - basic framing calculations
 */

/**
 * Compute number of trusses given length in feet and spacing in feet
 * Formula (v1): trussCount = ceil(length / spacing) + 1
 */
export function computeTrussCount(lengthFt: number, spacingFt: number) {
  if (spacingFt <= 0) return 0
  return Math.ceil(lengthFt / spacingFt) + 1
}

export function computeLegCount(trusses: number) {
  return trusses * 2
}

/**
 * Estimate braces using a simple rule-of-thumb.
 * - One brace per ~20' bay
 * - Add extra if legHeight > 12'
 * TODO: Replace with full ruleset from requirements
 */
export function estimateBraces(widthFt: number, lengthFt: number, legHeightFt: number) {
  const bays = Math.max(1, Math.ceil(lengthFt / 20))
  let base = bays * 2
  if (widthFt > 30) base += Math.ceil((widthFt - 30) / 20)
  if (legHeightFt > 12) base += bays
  return base
}
