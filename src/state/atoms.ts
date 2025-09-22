import { atom } from 'jotai'
import { DEFAULT_JOB } from './defaults'

export const stepAtom = atom(1)

export const loadJob = () => {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return DEFAULT_JOB
    const raw = window.localStorage.getItem('mbuilder:job')
    if (!raw) return DEFAULT_JOB
    return JSON.parse(raw)
  } catch (e) {
    return DEFAULT_JOB
  }
}

export const jobAtom = atom(loadJob())

// BOM filter: which categories to include in exports / UI
// BOM filters removed: always include all categories by default

// autosave/load
// saveJob util used elsewhere when needed
export const saveJob = (job: any) => {
  try {
    localStorage.setItem('mbuilder:job', JSON.stringify(job))
  } catch (e) {
    // ignore
  }
}

// Layout column widths (pixels) for left aside and right aside
export const rightColWidthAtom = atom<number>(320)

// layout order: 'main-right' (default) or 'main-left' (aside first)
export const layoutOrderAtom = atom<string>((typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') ? (window.localStorage.getItem('mbuilder:layoutOrder') || 'main-right') : 'main-right')

// when stacked, aside height in px
export const asideHeightAtom = atom<number>(300)

// which widget is selected for moving/resizing: 'main' | 'aside' | null
export const selectedWidgetAtom = atom<string | null>(null)

// stacked mode: if true, aside sits above/below main instead of left/right
export const stackedAtom = atom<boolean>((typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') ? (window.localStorage.getItem('mbuilder:stacked') === 'true') : false)

// persisted grid layout for GridPreview (stored as array of layout items)
export const loadGridLayout = () => {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null
    const raw = window.localStorage.getItem('mbuilder:gridLayout')
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export const gridLayoutAtom = atom<any[] | null>(loadGridLayout())

// persisted main/aside sizes
export const loadMainWidth = () => {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return 640
    const raw = window.localStorage.getItem('mbuilder:mainWidth')
    if (!raw) return 640
    return Number(raw)
  } catch (e) {
    return 640
  }
}

export const loadMainHeight = () => {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return 500
    const raw = window.localStorage.getItem('mbuilder:mainHeight')
    if (!raw) return 500
    return Number(raw)
  } catch (e) {
    return 500
  }
}

export const mainWidthAtom = atom<number>(loadMainWidth())
export const mainHeightAtom = atom<number>(loadMainHeight())

