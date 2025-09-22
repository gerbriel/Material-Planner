import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const KEY = 'mbuilder:dark'

export default function DarkModeToggle({ onChange }: { onChange?: (dark: boolean) => void }) {
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
    // Dark-first design: when dark, ensure 'dark' and 'theme-dark' are present and remove 'light'
    // When light, remove dark classes and add 'light'
    if (dark) {
      el.classList.add('dark')
      el.classList.add('theme-dark')
      el.classList.remove('light')
    } else {
      el.classList.remove('dark')
      el.classList.remove('theme-dark')
      el.classList.add('light')
    }
    localStorage.setItem(KEY, JSON.stringify(dark))
    // notify parent when the mode changes
    if (onChange) onChange(dark)
  }, [dark])

  return (
    <button onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode" className="p-2 rounded">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
