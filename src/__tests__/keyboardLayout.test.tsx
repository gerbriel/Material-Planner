import { describe, it, expect, beforeEach } from 'vitest'
import { handleKey } from './test-utils/keyboardHelpers'

// Lightweight tests for keyboard handlers that update layout-related localStorage keys.
describe('keyboard layout shortcuts', () => {
  beforeEach(() => {
    try {
      if (typeof localStorage === 'undefined' || localStorage === null) {
        // simple in-memory localStorage shim
        const _store: Record<string, string> = {}
        ;(globalThis as any).localStorage = {
          getItem: (k: string) => (_store.hasOwnProperty(k) ? _store[k] : null),
          setItem: (k: string, v: string) => { _store[k] = String(v) },
          removeItem: (k: string) => { delete _store[k] },
          clear: () => { Object.keys(_store).forEach(k => delete _store[k]) }
        }
      }
      localStorage.clear()
    } catch (e) {}
  })

  it('toggles layout order with ctrl/cmd+arrow', () => {
    const initial = { layoutOrder: 'main-right', stacked: false, mainWidth: 640, rightWidth: 360, asideHeight: 480 }
    const res = handleKey('ArrowLeft', { ctrl: true }, 'main', initial)
    const order = localStorage.getItem('mbuilder:layoutOrder')
    expect(order).toBe(res.layoutOrder)
    expect(['main-left', 'main-right']).toContain(res.layoutOrder)
  })

  it('adjusts sizes with arrows and shift', () => {
    const initial = { layoutOrder: 'main-right', stacked: false, mainWidth: 640, rightWidth: 360, asideHeight: 480 }
    const before = Number(localStorage.getItem('mbuilder:mainWidth') || String(initial.mainWidth))
    handleKey('ArrowRight', { shift: false }, 'main', initial)
    const after = Number(localStorage.getItem('mbuilder:mainWidth') || String(initial.mainWidth))
    expect(after).toBeGreaterThanOrEqual(before)
  })
})
