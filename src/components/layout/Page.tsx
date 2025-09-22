import React, { useEffect } from 'react'

export default function Page({ children }: { children: React.ReactNode }) {
  return <div className="bg-transparent">{children}</div>
}
