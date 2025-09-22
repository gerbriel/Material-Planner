import React from 'react'
import DarkModeToggle from '../components/layout/DarkModeToggle'

export default function ThemePreview() {
  const [light, setLight] = React.useState<boolean>(() => {
    try { return document.documentElement.classList.contains('light') } catch { return false }
  })

  React.useEffect(() => {
    const el = document.documentElement
    if (light) {
      el.classList.add('light')
      el.classList.remove('dark')
      el.classList.remove('theme-dark')
    } else {
      el.classList.remove('light')
      el.classList.add('dark')
      el.classList.add('theme-dark')
    }
  }, [light])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Theme Preview</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">Light
            <input type="checkbox" checked={light} onChange={(e) => setLight(e.target.checked)} />
          </label>
          <DarkModeToggle />
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Buttons</h3>
          <div className="flex gap-3 items-center">
            <button className="btn btn--primary">Primary</button>
            <button className="btn btn--outline">Outline</button>
            <button className="btn btn--ghost">Ghost</button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Inputs</h3>
          <input className="input" placeholder="Text input" />
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Stepper</h3>
          <div className="stepper__step">
            <div className="stepper__dot stepper__dot--active" />
            <div>Step 1 — Building</div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">BOM Table</h3>
          <table className="table">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Notes</th></tr>
            </thead>
            <tbody>
              <tr><td>Truss</td><td>10</td><td>-</td></tr>
              <tr><td>Leg</td><td>20</td><td>-</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Tokens</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ['bg', 'bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)]'],
              ['card', 'bg-[var(--card)] text-[var(--fg)] border border-[var(--border)]'],
              ['card-2', 'bg-[var(--card-2)] text-[var(--fg)] border border-[var(--border)]'],
              ['primary', 'bg-[var(--primary)] text-[var(--bg)]'],
              ['primary-a10', 'bg-[var(--primary-a10)]'],
              ['primary-a20', 'bg-[var(--primary-a20)]'],
              ['primary-a30', 'bg-[var(--primary-a30)]'],
              ['success-a20', 'bg-[var(--success-a20)]'],
              ['warning-a20', 'bg-[var(--warning-a20)]'],
              ['danger-a20', 'bg-[var(--danger-a20)]'],
              ['info-a20', 'bg-[var(--info-a20)]'],
            ].map(([name, cls]) => (
              <div key={name as string} className={`rounded p-3 ${cls as string}`}>
                <div className="opacity-80">{name as string}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
