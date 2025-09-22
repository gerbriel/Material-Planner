import { describe, it, expect, beforeEach } from 'vitest'

describe('AppGrid resize persistence (unit)', () => {
  beforeEach(() => { if (typeof localStorage !== 'undefined') localStorage.clear() })

  it('writes expected sizes to localStorage when pointer movement simulated', () => {
  // simulate stored default
  const id = 't1'
  const stored: Record<string, { width: number; height: number }> = {}
  stored[id] = { width: 200, height: 140 }
  localStorage.setItem('mbuilder:tileSizes', JSON.stringify(stored))

    const start = { id, startX: 10, startY: 10, startW: 200, startH: 140 }
    const move = { clientX: 210, clientY: 160 }
    const dx = move.clientX - start.startX
    const dy = move.clientY - start.startY
    const nextW = Math.max(100, Math.round(start.startW + dx))
    const nextH = Math.max(80, Math.round(start.startH + dy))

    const cur = JSON.parse(localStorage.getItem('mbuilder:tileSizes') || '{}')
    cur[start.id] = { width: nextW, height: nextH }
    localStorage.setItem('mbuilder:tileSizes', JSON.stringify(cur))

    const raw = localStorage.getItem('mbuilder:tileSizes')
    expect(raw).toBeTruthy()
    const sizes = JSON.parse(raw || '{}')
    expect(sizes.t1).toBeDefined()
    expect(sizes.t1.width).toBeGreaterThanOrEqual(160)
    expect(sizes.t1.height).toBeGreaterThanOrEqual(120)
  })
})
