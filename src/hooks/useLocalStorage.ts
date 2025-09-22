import { useState, useEffect } from 'react'

export default function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initial
      const parsed = JSON.parse(raw) as T
      // guard against stored `null` which may come from previous writes
      return parsed === null ? initial : parsed
    } catch (e) {
      return initial
    }
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)) } catch (e) {}
  }, [key, state])

  return [state, setState] as const
}
