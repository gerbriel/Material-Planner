import React from 'react'

type Props = {
  children: React.ReactNode
  columnCount?: number
  // indices of columns that should have a resizer handle on their right edge
  resizableIndices?: number[]
  initialWidths?: number[]
}

export default function ColumnResizerTable({ children, columnCount = 6, resizableIndices, initialWidths }: Props) {
  // default widths: first column 200, others 150
  const defaultWidths = React.useMemo(() => {
    const arr = new Array(columnCount).fill(150)
    if (columnCount > 0) arr[0] = 200
    return arr
  }, [columnCount])

  const [widths, setWidths] = React.useState<number[]>(initialWidths && initialWidths.length === columnCount ? initialWidths : defaultWidths)
  const dragging = React.useRef(false)
  const dragIndex = React.useRef<number | null>(null)
  const startX = React.useRef(0)
  const startW = React.useRef(0)
  const [hover, setHover] = React.useState<number | null>(null)

  const indices = resizableIndices && resizableIndices.length ? resizableIndices : Array.from({ length: Math.max(0, columnCount - 1) }, (_, i) => i)

  React.useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current || dragIndex.current === null) return
      const dx = e.clientX - startX.current
      const next = Math.max(80, Math.round(startW.current + dx))
      setWidths((w) => {
        const copy = w.slice()
        copy[dragIndex.current as number] = next
        return copy
      })
    }
    function onUp() {
      if (!dragging.current) return
      dragging.current = false
      dragIndex.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const onMouseDown = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault()
    dragging.current = true
    dragIndex.current = colIndex
    startX.current = e.clientX
    startW.current = widths[colIndex] || 0

    function onMove(e: MouseEvent) {
      if (!dragging.current || dragIndex.current === null) return
      const dx = e.clientX - startX.current
      const next = Math.max(80, Math.round(startW.current + dx))
      setWidths((w) => {
        const copy = w.slice()
        copy[dragIndex.current as number] = next
        return copy
      })
    }
    function onUp() {
      dragging.current = false
      dragIndex.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const handleBaseStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    cursor: 'col-resize',
    transition: 'background-color 120ms ease'
  }

  return (
    <table className="w-full text-sm mt-2" style={{ borderCollapse: 'collapse' }}>
      <colgroup>
        {Array.from({ length: columnCount }).map((_, i) => (
          <col key={i} style={widths[i] ? { width: `${widths[i]}px` } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr className="text-left text-xs text-muted-500">
          {/* default headers for common BOM table; keep flexible count */}
          {['Item', 'Qty', 'Length', 'Color', 'Unit', 'Notes'].slice(0, columnCount).map((h, i) => (
            <th key={i} style={{ position: 'relative', userSelect: 'none' }}>
              {h}
              {indices.includes(i) && (
                <div
                  onMouseDown={(e) => onMouseDown(e, i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((s) => (s === i ? null : s))}
                  style={{ ...handleBaseStyle, backgroundColor: hover === i ? 'rgba(0,0,0,0.04)' : 'transparent' }}
                  aria-hidden
                />
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  )
}
