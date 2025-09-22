import React from 'react'

export default function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <span className="relative group inline-block">
      <span className="underline cursor-help">{children}</span>
      <span className="absolute left-0 -bottom-8 w-max hidden group-hover:block bg-card-dark border border-border text-xs p-2 rounded z-10">{text}</span>
    </span>
  )
}
