import { describe, it, expect, beforeEach } from 'vitest'
import { computeKeyboardEffects } from '../../lib/keyboard'

describe('AppGrid keyboard pane behaviors (unit)', () => {
  beforeEach(() => { if (typeof localStorage !== 'undefined') localStorage.clear() })

  it('computeKeyboardEffects increases mainWidth on ArrowRight', () => {
    const baseState = { layoutOrder: 'main-left', stacked: false, mainWidth: 400, rightWidth: 300, asideHeight: 200 }
    const res = computeKeyboardEffects('ArrowRight', { shift: false, alt: false, ctrl: false, meta: false }, 'main', baseState as any)
    expect(res.mainWidth).toBeGreaterThan(baseState.mainWidth)
  })
})
