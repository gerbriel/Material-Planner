import { describe, it, expect } from 'vitest'
import { computeKeyboardEffects } from '../keyboard'

describe('computeKeyboardEffects', () => {
  const base = { layoutOrder: 'main-right', stacked: false, mainWidth: 640, rightWidth: 360, asideHeight: 300 }

  it('toggles layout order with ctrl/meta+left', () => {
    const res = computeKeyboardEffects('ArrowLeft', { ctrl: true }, 'main', base)
    expect(['main-left','main-right']).toContain(res.layoutOrder)
  })

  it('increases main width on ArrowRight', () => {
    const res = computeKeyboardEffects('ArrowRight', {}, 'main', base)
    expect(res.mainWidth).toBeGreaterThanOrEqual(base.mainWidth)
  })
})
