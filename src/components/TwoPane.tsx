import React from 'react'

type LayoutState = {
  mainWidthPct: number
  asideWidthPct: number
  mainHeightPx: number
  asideHeightPx: number
}

const STORAGE_KEY = 'builder:layout'

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)) }

function readInitial(): LayoutState {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  const defaultMainPct = 0.62
  const defaultAside = 1 - defaultMainPct
  const workspaceH = typeof window !== 'undefined' ? window.innerHeight : 800
  const defaultH = Math.max(240, workspaceH - 32)
  return { mainWidthPct: defaultMainPct, asideWidthPct: defaultAside, mainHeightPx: defaultH, asideHeightPx: defaultH }
}

export default function TwoPane() {
  const workspaceRef = React.useRef<HTMLDivElement | null>(null)
  const announcerRef = React.useRef<HTMLDivElement | null>(null)
  const [{ mainWidthPct, asideWidthPct, mainHeightPx, asideHeightPx }, setState] = React.useState<LayoutState>(() => readInitial())

  // rAF throttling for pointer moves
  const rafRef = React.useRef<number | null>(null)
  const pendingRef = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    // set css var
    const el = workspaceRef.current
    if (!el) return
    el.style.setProperty('--main-w', `${(mainWidthPct * 100).toFixed(2)}%`)
    el.style.setProperty('--main-h', `${Math.round(mainHeightPx)}px`)
    el.style.setProperty('--aside-h', `${Math.round(asideHeightPx)}px`)
  }, [mainWidthPct, mainHeightPx, asideHeightPx])

  React.useEffect(() => {
    // persist after changes (debounced by pointerup handler; also persist on unmount)
    return () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mainWidthPct, asideWidthPct, mainHeightPx, asideHeightPx })) } catch (e) {}
    }
  }, [mainWidthPct, asideWidthPct, mainHeightPx, asideHeightPx])

  function saveState(next: LayoutState) {
    setState(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) {}
    if (announcerRef.current) announcerRef.current.textContent = `Main ${Math.round(next.mainWidthPct * 100)}% — Main height ${Math.round(next.mainHeightPx)}px`
  }

  // helpers for pointer drag lifecycle
  function startDrag(e: PointerEvent, onMove: (dx: number, dy: number) => void, onEnd?: () => void) {
    e.preventDefault()
    try { (e.target as Element).setPointerCapture(e.pointerId) } catch {}
    const startX = e.clientX
    const startY = e.clientY
    function move(ev: PointerEvent) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      // throttle via rAF
      pendingRef.current = () => onMove(dx, dy)
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        if (pendingRef.current) {
          pendingRef.current()
          pendingRef.current = null
        }
      })
    }
    function up() {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      if (onEnd) onEnd()
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  // splitter drag: adjust mainWidthPct
  function handleSplitterPointerDown(e: React.PointerEvent) {
    const ws = workspaceRef.current
    if (!ws) return
    document.body.style.userSelect = 'none'
    const startPct = mainWidthPct
    const w = ws.clientWidth
    startDrag(e.nativeEvent as PointerEvent, (dx) => {
      const px = startPct * w + dx
      const pct = clamp(px / w, 0.3, 0.8)
      setState(s => ({ ...s, mainWidthPct: pct, asideWidthPct: 1 - pct }))
    }, () => {
      document.body.style.userSelect = ''
      const next = { mainWidthPct: mainWidthPct, asideWidthPct: 1 - mainWidthPct, mainHeightPx, asideHeightPx }
      saveState(next)
    })
  }

  // pane bottom edge drag
  function makeBottomHandle(id: 'main' | 'aside') {
    return function onPointerDown(e: React.PointerEvent) {
      const startH = id === 'main' ? mainHeightPx : asideHeightPx
      const ws = workspaceRef.current
      if (!ws) return
      document.body.style.userSelect = 'none'
      startDrag(e.nativeEvent as PointerEvent, (_dx, dy) => {
        const nextH = clamp(Math.round(startH + dy), 240, ws.clientHeight)
        if (id === 'main') setState(s => ({ ...s, mainHeightPx: nextH }))
        else setState(s => ({ ...s, asideHeightPx: nextH }))
      }, () => {
        document.body.style.userSelect = ''
        saveState({ mainWidthPct, asideWidthPct, mainHeightPx, asideHeightPx })
      })
    }
  }

  // corner handle - adjusts width (via splitter) and height
  function makeCornerHandle(id: 'main' | 'aside') {
    return function onPointerDown(e: React.PointerEvent) {
      const ws = workspaceRef.current
      if (!ws) return
      const startH = id === 'main' ? mainHeightPx : asideHeightPx
      const startPct = mainWidthPct
      const w = ws.clientWidth
      document.body.style.userSelect = 'none'
      startDrag(e.nativeEvent as PointerEvent, (dx, dy) => {
        const px = startPct * w + dx
        const pct = clamp(px / w, 0.3, 0.8)
        const nextH = clamp(Math.round(startH + dy), 240, ws.clientHeight)
        setState(s => ({ ...s, mainWidthPct: pct, asideWidthPct: 1 - pct, mainHeightPx: id === 'main' ? nextH : s.mainHeightPx, asideHeightPx: id === 'aside' ? nextH : s.asideHeightPx }))
      }, () => {
        document.body.style.userSelect = ''
        saveState({ mainWidthPct, asideWidthPct, mainHeightPx, asideHeightPx })
      })
    }
  }

  // keyboard handlers for handles
  function handleSplitterKeyDown(e: React.KeyboardEvent) {
    const stepPct = e.shiftKey ? 0.04 : 0.01
    let nextPct = mainWidthPct
    if (e.key === 'ArrowLeft') nextPct = clamp(mainWidthPct - stepPct, 0.3, 0.8)
    if (e.key === 'ArrowRight') nextPct = clamp(mainWidthPct + stepPct, 0.3, 0.8)
    if (nextPct !== mainWidthPct) {
      const next = { mainWidthPct: nextPct, asideWidthPct: 1 - nextPct, mainHeightPx, asideHeightPx }
      saveState(next)
      e.preventDefault()
    }
  }

  function makeEdgeKeyDown(id: 'main' | 'aside') {
    return function onKey(e: React.KeyboardEvent) {
      const step = e.shiftKey ? 32 : 8
      let changed = false
      let nextH = id === 'main' ? mainHeightPx : asideHeightPx
      if (e.key === 'ArrowUp') { nextH = clamp(nextH - step, 240, window.innerHeight); changed = true }
      if (e.key === 'ArrowDown') { nextH = clamp(nextH + step, 240, window.innerHeight); changed = true }
      if (changed) {
        const next = id === 'main' ? { mainWidthPct, asideWidthPct, mainHeightPx: nextH, asideHeightPx } : { mainWidthPct, asideWidthPct, mainHeightPx, asideHeightPx: nextH }
        saveState(next)
        e.preventDefault()
      }
    }
  }

  const mainPctRounded = Math.round(mainWidthPct * 100)
  const asidePctRounded = Math.round(asideWidthPct * 100)

  return (
    <div ref={workspaceRef} className="workspace" role="region" aria-label="Two pane workspace">
      <section id="main" className="pane" style={{ height: 'var(--main-h)' }}>
        <header className="pane-header">Main</header>
        <div className="pane-body">{/* sample content */}
          <p>This is the main pane. Try resizing the splitter or the bottom edge/corner.</p>
          <p style={{ height: 1000 }} />
        </div>
        <button
          className="resize-handle s"
          role="slider"
          aria-label="Resize main height"
          aria-valuemin={240}
          aria-valuemax={workspaceRef.current?.clientHeight || 9999}
          aria-valuenow={mainHeightPx}
          onPointerDown={makeBottomHandle('main')}
          onKeyDown={makeEdgeKeyDown('main')}
        >
          <svg width="14" height="6" viewBox="0 0 14 6" aria-hidden>
            <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
        <button className="resize-handle se" aria-label="Resize main corner" onPointerDown={makeCornerHandle('main')}>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path d="M0 8 L8 0 M6 0 L8 0 L8 2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      </section>

      <div
        role="separator"
        tabIndex={0}
        className="splitter v"
        aria-orientation="vertical"
        aria-label="Resize panes"
        aria-valuemin={30}
        aria-valuemax={80}
        aria-valuenow={mainPctRounded}
        onPointerDown={handleSplitterPointerDown}
        onKeyDown={handleSplitterKeyDown}
        title={`Main ${mainPctRounded}% — Aside ${asidePctRounded}%`}
      >
        <div className="splitter-glyph" aria-hidden>
          <svg width="12" height="28" viewBox="0 0 12 28">
            <g fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6 v2" />
              <path d="M6 12 v2" />
              <path d="M6 18 v2" />
            </g>
          </svg>
        </div>
      </div>

      <aside id="aside" className="pane" style={{ height: 'var(--aside-h)' }}>
        <header className="pane-header">Aside</header>
        <div className="pane-body">{/* sample content */}
          <p>Aside content</p>
          <p style={{ height: 600 }} />
        </div>
        <button
          className="resize-handle s"
          role="slider"
          aria-label="Resize aside height"
          aria-valuemin={240}
          aria-valuemax={workspaceRef.current?.clientHeight || 9999}
          aria-valuenow={asideHeightPx}
          onPointerDown={makeBottomHandle('aside')}
          onKeyDown={makeEdgeKeyDown('aside')}
        >
          <svg width="14" height="6" viewBox="0 0 14 6" aria-hidden>
            <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
        <button className="resize-handle sw" aria-label="Resize aside corner" onPointerDown={makeCornerHandle('aside')}>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path d="M10 8 L2 0 M4 0 L2 0 L2 2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      </aside>

      <div ref={announcerRef} className="sr-only" aria-live="polite" />
    </div>
  )
}
