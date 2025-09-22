import React from 'react'
import { useAtom } from 'jotai'
import useLocalStorage from '../hooks/useLocalStorage'
import RGL, { WidthProvider, Layout } from 'react-grid-layout'
import {
  layoutOrderAtom,
  stackedAtom,
  mainWidthAtom,
  rightColWidthAtom,
  asideHeightAtom,
} from '../state/atoms'
import { computeKeyboardEffects } from '../lib/keyboard'
import './app-grid.css'

// Small, well-formatted AppGrid to avoid transform/preamble detection issues.
const ReactGridLayout = WidthProvider(RGL)

function AppGridInner(props: any) {
  const initialTiles: any[] = props.initialTiles || []
  const tiles = initialTiles
  const [tileSizes, setTileSizes] = useLocalStorage('mbuilder:tileSizes', {})
  const effectiveTiles = Array.isArray(tiles) ? tiles.filter(Boolean) : []

  function makeDefaultLayout(tilesArr: any[]): Layout[] {
    // Place main at left, aside at right, lean-to tiles stacked under main
    let underMainIndex = 0
    let rightIndex = 0
    return tilesArr.map((t: any) => {
      if (t.id === 'main') return { i: 'main', x: 0, y: 0, w: 8, h: 18, minW: 4, minH: 10, resizeHandles: ['e','s','se'] } as Layout
      if (t.id === 'aside') {
        const y = rightIndex * 18
        rightIndex += 1
        return { i: 'aside', x: 8, y, w: 4, h: 18, minW: 3, minH: 10, resizeHandles: ['w','s','sw'] } as Layout
      }
      // lean-to and other auxiliary tiles go under main by default
      const y = 18 + underMainIndex * 18
      underMainIndex += 1
      return { i: t.id, x: 0, y, w: 8, h: 18, minW: 3, minH: 10, resizeHandles: ['e','s','se'] } as Layout
    })
  }

  const [savedLayout, setSavedLayout] = useLocalStorage<Layout[]>('mbuilder:gridLayout', makeDefaultLayout(effectiveTiles))

  const [layoutOrder, setLayoutOrder] = useAtom(layoutOrderAtom)
  const [stacked, setStacked] = useAtom(stackedAtom)
  const [mainWidth, setMainWidth] = useAtom(mainWidthAtom)
  const [rightWidth, setRightWidth] = useAtom(rightColWidthAtom)
  const [asideHeight, setAsideHeight] = useAtom(asideHeightAtom)

  const liveRef = React.useRef<HTMLDivElement | null>(null)
  const resizeRef = React.useRef<{ id: string | null; startX: number; startY: number; startW: number; startH: number }>({ id: null, startX: 0, startY: 0, startW: 0, startH: 0 })

  function announce(text: string) {
    if (liveRef.current) liveRef.current.textContent = text
  }

  function onSeparatorPointerDown(e: any, id: string) {
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    const stored = (() => { try { return JSON.parse(localStorage.getItem('mbuilder:tileSizes') || '{}') } catch { return {} } })()
    const cur = stored[id] || { width: 200, height: 140 }
    resizeRef.current = { id, startX: e.clientX, startY: e.clientY, startW: cur.width, startH: cur.height }
  }

  function onSeparatorPointerMove(e: any) {
    const rs = resizeRef.current
    if (!rs || !rs.id) return
    const dx = e.clientX - rs.startX
    const dy = e.clientY - rs.startY
    const nextW = Math.max(100, Math.round(rs.startW + dx))
    const nextH = Math.max(80, Math.round(rs.startH + dy))
    setTileSizes((prev: any) => ({ ...prev, [rs.id as string]: { width: nextW, height: nextH } }))
    try {
      const cur = JSON.parse(localStorage.getItem('mbuilder:tileSizes') || '{}')
      cur[rs.id as string] = { width: nextW, height: nextH }
      localStorage.setItem('mbuilder:tileSizes', JSON.stringify(cur))
    } catch {}
  }

  function onSeparatorPointerUp(e: any) {
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    if (resizeRef.current) resizeRef.current.id = null
  }

  function handleKeyDown(e: any, id: string) {
    const next = computeKeyboardEffects(
      e.key,
      { shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey, meta: e.metaKey },
      id === 'main' ? 'main' : 'aside',
      { layoutOrder, stacked, mainWidth, rightWidth, asideHeight }
    )
    if (!next) return
    if (next.layoutOrder) setLayoutOrder(next.layoutOrder)
    if (typeof next.stacked === 'boolean') setStacked(next.stacked)
    if (typeof next.mainWidth === 'number') setMainWidth(next.mainWidth)
    if (typeof next.rightWidth === 'number') setRightWidth(next.rightWidth)
    if (typeof next.asideHeight === 'number') setAsideHeight(next.asideHeight)
    announce(`Adjusted ${id}`)
    e.preventDefault()
  }

  const currentTiles = Array.isArray(tiles) ? tiles.filter(Boolean) : []

  // Merge saved layout with current tiles: drop missing, add new with defaults
  const layoutIds = new Set((savedLayout || []).map((l: any) => l.i))
  const tileIds = new Set(currentTiles.map((t: any) => t.id))
  let layout: Layout[] = (savedLayout || []).filter((l: any) => tileIds.has(l.i))

  // Add missing tiles to layout with default positions
  const missingTiles = currentTiles.filter((t: any) => !layoutIds.has(t.id))
  if (missingTiles.length > 0) {
    // Base positions: stack lean-to tiles under main; aside on right under previous
    const mainItem = (layout as any[]).find(l => l.i === 'main')
    const mainBottom = mainItem ? (mainItem.y + mainItem.h) : 18
    const rightMaxY = (layout as any[])
      .filter(l => l.i === 'aside')
      .reduce((max: number, it: any) => Math.max(max, (it.y || 0) + (it.h || 0)), 0)
    let yUnderMain = mainBottom
    let yRight = rightMaxY
    for (const t of missingTiles) {
      if (t.id === 'main') {
        layout.push({ i: 'main', x: 0, y: 0, w: 8, h: 18, minW: 4, minH: 10, resizeHandles: ['e','s','se'] } as any)
      } else if (t.id === 'aside') {
        layout.push({ i: 'aside', x: 8, y: yRight, w: 4, h: 18, minW: 3, minH: 10, resizeHandles: ['w','s','sw'] } as any)
        yRight += 18
      } else if (String(t.id).startsWith('lean-')) {
        layout.push({ i: t.id, x: 0, y: yUnderMain, w: 8, h: 18, minW: 3, minH: 10, resizeHandles: ['e','s','se'] } as any)
        yUnderMain += 18
      } else {
        // default to right column for any unknown tile
        layout.push({ i: t.id, x: 8, y: yRight, w: 4, h: 18, minW: 3, minH: 10, resizeHandles: ['w','s','sw'] } as any)
        yRight += 18
      }
    }
  }

  return (
    <ReactGridLayout
      className="layout app-grid-rgl"
      layout={layout}
      cols={12}
      rowHeight={12}
      width={960}
      margin={[12,12]}
      containerPadding={[12,0]}
      useCSSTransforms={false}
      compactType={'horizontal'}
      dragClass="rgl-dragging"
      placeholderClassName="react-grid-placeholder"
      draggableCancel=".panel-body"
      draggableHandle=".panel-header"
      isBounded
      isDraggable
      isResizable
      onLayoutChange={(nextLayout: Layout[]) => {
        setSavedLayout(nextLayout)
        try { localStorage.setItem('mbuilder:gridLayout', JSON.stringify(nextLayout)) } catch {}
      }}
      onResizeStop={(layoutArg: Layout[], oldItem: any, newItem: any) => {
        try {
          const cols = 12
          const containerWidth = 960
          const colWidth = containerWidth / cols
          const rowHeightPx = 12
          const sizesRaw = (() => { try { return JSON.parse(localStorage.getItem('mbuilder:tileSizes') || '{}') } catch { return {} } })()
          sizesRaw[newItem.i] = { width: Math.round(newItem.w * colWidth), height: Math.round(newItem.h * rowHeightPx) }
          localStorage.setItem('mbuilder:tileSizes', JSON.stringify(sizesRaw))
          setTileSizes(sizesRaw)
        } catch (e) {}
      }}
    >
      {currentTiles.map((t: any) => {
        const ts: any = tileSizes
        const size = (ts && ts[t.id]) ? ts[t.id] : undefined
        const bodyStyle = size ? { minHeight: Math.max(0, (size.height || 0) - 36) } : undefined
        return (
          <div key={t.id} className="grid-item-wrapper" role="listitem" tabIndex={0}>
            <div className="panel">
              <div className="panel-header">{t.label}</div>
              <div className="panel-body" style={bodyStyle}>{t.content}</div>
            </div>
          </div>
        )}
      )}
    </ReactGridLayout>
  )
}

const AppGrid = AppGridInner
export default AppGrid
