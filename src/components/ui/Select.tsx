import React from 'react'

export default function Select({ children, ...rest }: any) {
  return (
    <select className="w-full p-2 rounded border border-border bg-transparent" {...rest}>
      {children}
    </select>
  )
}
