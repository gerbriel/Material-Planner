import React from 'react'
import { useAtom } from 'jotai'
import { stepAtom } from '../../state/atoms'

export default function Sidebar({ steps }: { steps: { id: number; title: string }[] }) {
  // Sidebar nav removed — navigation is now in Topbar. Keep component to avoid refactor.
  return null
}
