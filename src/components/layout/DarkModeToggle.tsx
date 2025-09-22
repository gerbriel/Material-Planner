import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const KEY = 'mbuilder:dark'

export default function DarkModeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : true
    } catch (e) {
      return true
    }
  })

  useEffect(() => {
    const el = document.documentElement
    // dark-first design: add .light to enable light mode, remove to stay dark
    if (dark) el.classList.remove('light')
    else el.classList.add('light')
    localStorage.setItem(KEY, JSON.stringify(dark))
  }, [dark])

  return (
    <button onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode" className="p-2 rounded">
      {dark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
