export type Foundation = 'bare' | 'concrete' | 'asphalt'

/**
 * Detailed anchor calculation.
 * Rules (heuristic):
 * - Bare (dirt): use rebar stakes: 2 per leg for small buildings, 4 per leg for wide/heavy
 * - Concrete: use wedge anchors: 4 per leg (one at each corner of base plate) by default
 * - Asphalt: use asphalt anchor kits: 1 kit per ~10 legs
 * Returns a breakdown object with type and total qty plus perLeg count.
 */
export function countAnchorsDetailed(legs: number, foundation: Foundation = 'bare', gauge = 24, widthFt = 20) {
  if (legs <= 0) return { type: 'none', qty: 0, perLeg: 0 }

  if (foundation === 'bare') {
    // heavier gauges or wider buildings get more rebar per leg
    const perLeg = gauge <= 18 || widthFt > 40 ? 4 : 2
    return { type: 'rebar', qty: legs * perLeg, perLeg }
  }

  if (foundation === 'concrete') {
    // wedge anchors 4 per leg typically
    const perLeg = 4
    return { type: 'wedge', qty: legs * perLeg, perLeg }
  }

  if (foundation === 'asphalt') {
    const perKitLegs = 10
    const qty = Math.ceil(legs / perKitLegs)
    return { type: 'asphalt_kit', qty, perLeg: 0 }
  }

  return { type: 'unknown', qty: 0, perLeg: 0 }
}

// Backwards-compatible wrapper
export function countAnchors(legs: number, foundation: Foundation = 'bare') {
  // Legacy behavior preserved for backward compatibility with older callers/tests
  if (foundation === 'bare') return { type: 'rebar', qty: legs }
  if (foundation === 'concrete') return { type: 'wedge', qty: legs * 4 }
  if (foundation === 'asphalt') return { type: 'asphalt_sets', qty: Math.ceil(legs / 10) }
  return { type: 'unknown', qty: 0 }
}

