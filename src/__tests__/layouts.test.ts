import { saveLayout, loadNamedLayouts, deleteLayout } from '../lib/layouts'
import { describe, it, expect, beforeEach } from 'vitest'

describe('named layouts persistence', () => {
  beforeEach(() => {
    try { localStorage.clear() } catch (e) {}
  })

  it('saves and loads a named layout', () => {
    saveLayout('foo', { mainWidth: 400, rightWidth: 200 })
    const all = loadNamedLayouts()
    expect(all.foo).toBeDefined()
    expect(all.foo.mainWidth).toBe(400)
  })

  it('deletes a layout', () => {
    saveLayout('bar', { mainWidth: 100 })
    deleteLayout('bar')
    const all = loadNamedLayouts()
    expect(all.bar).toBeUndefined()
  })
})
