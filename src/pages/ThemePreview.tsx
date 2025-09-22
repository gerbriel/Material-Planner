import React from 'react'
import DarkModeToggle from '../components/layout/DarkModeToggle'

export default function ThemePreview() {
  const [light, setLight] = React.useState<boolean>(() => {
    try { return document.documentElement.classList.contains('light') } catch { return false }
  })

  React.useEffect(() => {
    if (light) document.documentElement.classList.add('light')
    else document.documentElement.classList.remove('light')
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
      </section>
    </div>
  )
}
