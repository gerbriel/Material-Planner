/**
 * trims.ts - compute linear feet for trims and convert to 11' sticks
 */

export function computeTrimLF(perimeterFt: number, extra: number = 0) {
  const lf = perimeterFt + extra
  const sticks = Math.ceil(lf / 11)
  return { lf, sticks }
}

export function headerSealsForRollups(count: number) {
  return count // one per roll-up
}

/**
 * Detailed trims breakdown
 * Accepts an object with estimated lengths for each trim type (in ft)
 * Returns total linear feet and an optimized stick count using 11' stock.
 */
export function breakdownTrims(lengths: Record<string, number>, options: { wasteFactor?: number } = {}) {
  const wasteFactor = options.wasteFactor ?? 1.05
  // Sum total LF
  const items = Object.entries(lengths).map(([k, v]) => ({ type: k, lf: v }))
  const total = items.reduce((s, it) => s + it.lf, 0)

  // apply waste and rounding per item
  const itemsWithWaste = items.map((it) => {
    const wasted = it.lf * wasteFactor
    const rounded = Math.ceil(wasted * 10) / 10 // round up to 0.1 ft
    return { ...it, wastedLF: wasted, roundedLF: rounded }
  })

  // Simple greedy first-fit for 11' sticks: pack longest pieces first
  const pieces: number[] = []
  for (const it of itemsWithWaste) {
    // assume each trim type is delivered in continuous lengths; split into 11' pieces
    let remaining = it.roundedLF
    while (remaining > 0.0001) {
      const take = Math.min(11, remaining)
      pieces.push(take)
      remaining -= take
    }
  }

  // Optimize by sorting descending and attempting to pair into sticks of 11'
  pieces.sort((a, b) => b - a)
  const sticks: number[] = []
  for (const p of pieces) {
    // try to fit into existing sticks
    let placed = false
    for (let i = 0; i < sticks.length; i++) {
      if (sticks[i] + p <= 11 + 1e-6) {
        sticks[i] += p
        placed = true
        break
      }
    }
    if (!placed) sticks.push(p)
  }

  const totalWasted = itemsWithWaste.reduce((s, it) => s + it.roundedLF, 0)

  return {
    items: itemsWithWaste,
    totalLF: total,
    wasteFactor,
    totalWastedLF: totalWasted,
    sticks: sticks.length,
    sticksDetail: sticks,
  }
}

