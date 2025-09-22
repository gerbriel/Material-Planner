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
  const ignoreSaved = !!props.ignoreSaved
  // Always call the hook with the expected signature. Choose the effective
  // tiles based on the ignoreSaved flag so we don't load a saved aside when
  // the app is rendering the Review (step 2) page.
  const [savedTiles] = useLocalStorage('mbuilder:appGridOrder', initialTiles as any)
  const tiles = ignoreSaved ? initialTiles : (Array.isArray(savedTiles) ? savedTiles : initialTiles)
  const [tileSizes, setTileSizes] = useLocalStorage('mbuilder:tileSizes', {})

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

  const safeTiles = Array.isArray(tiles) ? tiles.filter(Boolean) : []

  // If we only have main/aside tiles, render them inside a small react-grid-layout
  if (safeTiles.length <= 2) {
    // build layout
    const layout: Layout[] = safeTiles.map((t: any, idx: number) => {
      if (t.id === 'main') return { i: 'main', x: 0, y: 0, w: 8, h: 18, minW: 4, minH: 10, resizeHandles: ['e','s','se'] }
      return { i: t.id, x: 8, y: 0, w: 4, h: 18, minW: 3, minH: 10, resizeHandles: ['w','s','sw'] }
    })

    return (
      <ReactGridLayout
        className="layout app-grid-rgl"
        layout={layout}
        cols={12}
        rowHeight={12}
  width={960}
  margin={[12,12]}
  // remove vertical container padding so items don't get an extra top offset
  containerPadding={[12,0]}
  useCSSTransforms={false}
  compactType={'horizontal'}
        // visual and interaction props to mirror the GridPreview behavior
        dragClass="rgl-dragging"
        placeholderClassName="react-grid-placeholder"
        draggableCancel=".panel-body"
        draggableHandle=".panel-header"
        isBounded
        isDraggable
        isResizable
        onLayoutChange={(nextLayout: Layout[]) => {
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
        {safeTiles.map((t: any) => {
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
          )
        })}
      </ReactGridLayout>
    )
  }

  const children = safeTiles.map((t: any) => {
    const label = React.createElement('div', { className: 'tile-label' }, t?.label ?? 'Untitled')
    const content = React.createElement('div', { className: 'tile-content' }, t?.content ?? null)
    const handle = React.createElement('div', {
      role: 'separator',
      'aria-orientation': 'horizontal',
      onPointerDown: (e: any) => onSeparatorPointerDown(e, t.id),
      onPointerMove: onSeparatorPointerMove,
      onPointerUp: onSeparatorPointerUp,
      className: 'tile-resize-handle',
    })

    return React.createElement(
      'div',
      { key: t.id, 'data-tile': true, role: 'listitem', tabIndex: 0, onKeyDown: (e: any) => handleKeyDown(e, t.id) },
      label,
      content,
      handle
    )
  })

  const live = React.createElement('div', { ref: liveRef, className: 'sr-only', 'aria-live': 'polite' })

  return React.createElement('div', { className: 'app-grid', role: 'list' }, ...children, live)
}

const AppGrid = AppGridInner
export default AppGrid
