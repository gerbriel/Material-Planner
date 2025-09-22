import React from 'react'

export default function Stepper({ steps, current }: { steps: { id: number; title: string }[]; current: number }) {
  return (
    <ol className="space-y-2">
      {steps.map((s) => (
        <li key={s.id} className={s.id === current ? 'font-semibold' : 'text-sm'}>{s.id}. {s.title}</li>
      ))}
    </ol>
  )
}
