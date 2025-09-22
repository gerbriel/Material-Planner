import React from 'react'

export default function NumberInput({ value, onChange, ...rest }: any) {
  return (
    <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full p-2 rounded border border-border bg-transparent" {...rest} />
  )
}
