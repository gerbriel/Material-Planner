import React from 'react'

export default function LabeledRow({ label, children }: any) {
  return (
    <div className="mb-2">
      <div className="text-sm text-muted-500 mb-1">{label}</div>
      <div>{children}</div>
    </div>
  )
}
