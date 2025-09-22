import React from 'react'
import RGL, { WidthProvider, Layout } from 'react-grid-layout'
import LiveSummary from '../components/layout/LiveSummary'
import StepReview from '../components/forms/StepReview'
import { useAtom, useSetAtom } from 'jotai'
import { gridLayoutAtom, selectedWidgetAtom } from '../state/atoms'

const ReactGridLayout = WidthProvider(RGL)

const initialLayout: any[] = [
  { i: 'main', x: 0, y: 0, w: 8, h: 18, minW: 4, minH: 10, maxW: 12, maxH: 100, resizeHandles: ['e','s','se'] },
  { i: 'aside', x: 8, y: 0, w: 4, h: 18, minW: 3, minH: 10, maxW: 12, maxH: 100, resizeHandles: ['w','s','sw'] }
]

export default function GridPreview() {
  const [storedLayout, setStoredLayout] = useAtom(gridLayoutAtom)
  const [selectedWidget, setSelectedWidget] = useAtom(selectedWidgetAtom)

  const [layout, setLayout] = React.useState<Layout[]>(storedLayout || initialLayout)
  const [isDragging, setIsDragging] = React.useState(false)
  const [tileSizes, setTileSizes] = React.useState<Record<string, { width: number; height: number }>>(() => {
    try { return JSON.parse(localStorage.getItem('mbuilder:tileSizes') || '{}') } catch { return {} }
  })

  function onLayoutChange(nextLayout: Layout[]) {
    setLayout(nextLayout)
    try {
      localStorage.setItem('mbuilder:gridLayout', JSON.stringify(nextLayout))
    } catch (e) {
      // ignore
    }
    // Jotai setter typing can be strict in this workspace; cast to any to ensure runtime set
    ;(setStoredLayout as unknown as (v: Layout[] | null) => void)(nextLayout)
  }

  function onDragStart() {
    setIsDragging(true)
  }

  function onDragStop() {
    setIsDragging(false)
  }

  return (
    <div className="p-6">
      {/* removed global zoom/scale wrapper to ensure pointer coords match DOM for resizing */}
      <h2 className="text-xl font-semibold mb-4">Grid Prototype (react-grid-layout)</h2>

  <div>
      <ReactGridLayout
        className="layout bg-transparent app-grid-rgl"
        layout={layout}
        cols={12}
        rowHeight={12}
        width={960}
        margin={[12, 12]}
        containerPadding={[12, 0]}
  // use top/left positioning instead of CSS transforms so items reflow more predictably
  useCSSTransforms={false}
  // enable horizontal compaction so neighboring tiles are pushed away in real-time
  // this makes panels reflow around the dragged item instead of stacking
  compactType="horizontal"
        onLayoutChange={onLayoutChange}
        onDragStart={onDragStart}
        onDragStop={(...args: any[]) => { onDragStop(); onLayoutChange((args as any)[0] || layout) }}
        onResizeStart={onDragStart}
        onResize={(...args: any[]) => {
          // onResize provides (layout, oldItem, newItem, placeholder, e, element)
          // we don't persist on every move to avoid thrashing localStorage but you could.
        }}
        onResizeStop={(...args: any[]) => {
          onDragStop();
          try {
            const newLayout = (args as any)[0] || layout
            localStorage.setItem('mbuilder:gridLayout', JSON.stringify(newLayout))
            // also persist per-tile pixel sizes for content layout
            const oldItem = (args as any)[1]
            const newItem = (args as any)[2]
            // compute column width from container (width / cols)
            const cols = 12
            const containerWidth = 960
            const colWidth = containerWidth / cols
            const rowHeightPx = 12
            const sizesRaw = (() => { try { return JSON.parse(localStorage.getItem('mbuilder:tileSizes') || '{}') } catch { return {} } })()
            sizesRaw[newItem.i] = { width: Math.round(newItem.w * colWidth), height: Math.round(newItem.h * rowHeightPx) }
            localStorage.setItem('mbuilder:tileSizes', JSON.stringify(sizesRaw))
          } catch (e) {}
          onLayoutChange((args as any)[0] || layout)
        }}
        // react-grid-layout visual hooks
        dragClass="rgl-dragging"
        placeholderClassName="react-grid-placeholder"
        draggableCancel=".panel-body"
        draggableHandle=".panel-header"
        isBounded
        isDraggable
        isResizable
      >
        <div key="main" className={`grid-item-wrapper ${isDragging ? 'dragging' : ''} ${selectedWidget === 'main' ? 'ring-2 ring-blue-400/25' : ''}`} tabIndex={0} onFocus={() => setSelectedWidget('main')} onBlur={() => setSelectedWidget(null)} onMouseEnter={() => setSelectedWidget('main')} onMouseLeave={() => setSelectedWidget(null)}>
          <div className="panel">
            <div className="panel-header">Main</div>
            <div className="panel-body" style={{ minHeight: tileSizes['main'] ? Math.max(0, tileSizes['main'].height - 36) : undefined }}>
              <StepReview />
            </div>
          </div>
        </div>

        <div key="aside" className={`grid-item-wrapper ${isDragging ? 'dragging' : ''} ${selectedWidget === 'aside' ? 'ring-2 ring-blue-400/25' : ''}`} tabIndex={0} onFocus={() => setSelectedWidget('aside')} onBlur={() => setSelectedWidget(null)} onMouseEnter={() => setSelectedWidget('aside')} onMouseLeave={() => setSelectedWidget(null)}>
          <div className="panel">
            <div className="panel-header">Aside</div>
            <div className="panel-body" style={{ minHeight: tileSizes['aside'] ? Math.max(0, tileSizes['aside'].height - 36) : undefined }}>
              <LiveSummary job={{ width: 24, length: 30, legHeight: 10, roofOrientation: 'vertical', wallOrientation: 'open' }} />
            </div>
          </div>
        </div>
  </ReactGridLayout>
  </div>

      <div className="mt-4 text-xs text-muted-500">Drag the header to move, resize via the handles. Layout is persisted to localStorage (key: <code>mbuilder:gridLayout</code>) and syncs with the Live Summary when you hover a section.</div>
    </div>
  )
}
