export function bracketCounts(openings: { type: string; side?: 'end' | 'side' }[]) {
  let walk = 0
  let window = 0
  let rollupSide = 0
  let rollupEnd = 0

  for (const o of openings) {
    if (o.type === 'walk') walk += 8
    if (o.type === 'window') window += 14
    if (o.type === 'rollup') {
      if (o.side === 'side') rollupSide += 4
      else rollupEnd += 4
    }
  }

  return { walk, window, rollupSide, rollupEnd }
}

/**
 * Compute reinforcement and materials for openings.
 * Returns an object with estimated header LF, L-brackets, and block/angle counts.
 * Heuristics:
 * - Walk door: header 4ft, 4 L-brackets, 2 pcs blocking
 * - Window: header = width + 1ft, 6 L-brackets
 * - Rollup: header = width + 2ft, 8 L-brackets for end, 6 for side
 */
export function computeOpeningReinforcement(openings: { type: 'walk' | 'window' | 'rollup'; widthFt?: number; side?: 'end' | 'side' }[], buildingWidthFt = 0) {
  let headerLF = 0
  let lBrackets = 0
  let blocking = 0

  for (const o of openings) {
    if (o.type === 'walk') {
      headerLF += 4
      lBrackets += 4
      blocking += 2
    }

    if (o.type === 'window') {
      const w = o.widthFt ?? 4
      headerLF += w + 1
      lBrackets += 6
      blocking += 1
    }

    if (o.type === 'rollup') {
      const w = o.widthFt ?? Math.min(12, buildingWidthFt)
      headerLF += w + 2
      if (o.side === 'side') lBrackets += 6
      else lBrackets += 8
      blocking += 3
    }
  }

  return { headerLF, lBrackets, blocking }
}

