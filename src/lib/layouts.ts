export type NamedLayouts = Record<string, any>

const STORAGE_KEY = 'mbuilder:namedLayouts'

function getStorage(): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined') return (globalThis as any).localStorage
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') return window.localStorage
    return null
  } catch (e) {
    return null
  }
}
let _inMemory: NamedLayouts | null = {}

export function loadNamedLayouts(): NamedLayouts {
  try {
    const s = getStorage()
    if (!s) return _inMemory || {}
    const raw = s.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch (e) {
    return _inMemory || {}
  }
}

export function saveNamedLayouts(obj: NamedLayouts) {
  try {
    const s = getStorage()
    if (!s) {
      _inMemory = obj
      return
    }
    s.setItem(STORAGE_KEY, JSON.stringify(obj))
  } catch (e) {
    _inMemory = obj
  }
}

export function saveLayout(name: string, layout: any) {
  const all = loadNamedLayouts()
  all[name] = layout
  saveNamedLayouts(all)
}

export function deleteLayout(name: string) {
  const all = loadNamedLayouts()
  delete all[name]
  saveNamedLayouts(all)
}
