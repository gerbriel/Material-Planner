import React from 'react'

export default function Button({ children, ...rest }: any) {
  return (
    <button className="px-3 py-2 rounded bg-primary-500 text-white" {...rest}>
      {children}
    </button>
  )
}
