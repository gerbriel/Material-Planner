import React from 'react'
import DarkModeToggle from './DarkModeToggle'

export default function ThemeFab() {
  const [open, setOpen] = React.useState(false)
  const [dark, setDark] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('mbuilder:dark')
      return raw ? JSON.parse(raw) : true
    } catch (e) {
      return true
    }
  })

  // Ensure any legacy attribute is cleared (feature removed)
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.removeAttribute('data-force-black')
    }
  }, [])

  const handleDarkChange = (isDark: boolean) => {
    setDark(isDark)
  }

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 100 }}>
      {open && (
        <div style={{
          position: 'absolute', right: 0, bottom: 56, width: 260,
          background: 'white', color: '#111', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', padding: 12
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Theme</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#555' }}>{dark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            <DarkModeToggle onChange={handleDarkChange} />
          </div>
          {/* Force black text option removed per request */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="/theme-preview" style={{ fontSize: 12, color: '#2563eb' }}>Open Theme Preview →</a>
          </div>
        </div>
      )}
      <button
        aria-label="Theme"
        onClick={() => setOpen(v => !v)}
        style={{
          width: 48, height: 48, borderRadius: 24, background: '#111', color: 'white',
          border: '1px solid rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title="Theme"
      >
        {/* simple palette icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3a9 9 0 100 18 3 3 0 003-3 2 2 0 012-2h1a3 3 0 000-6h-1a2 2 0 01-2-2 5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08"/>
        </svg>
      </button>
    </div>
  )
}
