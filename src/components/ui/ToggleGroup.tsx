import React from 'react'

export default function ToggleGroup({ options, value, onChange }: any) {
  return (
    <div className="flex gap-2">
      {options.map((o: any) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={`px-3 py-1 rounded ${o.value === value ? 'bg-primary-500 text-white' : 'bg-transparent border border-border'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
