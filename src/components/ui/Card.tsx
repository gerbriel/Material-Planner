import React from 'react'

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="card bg-card-dark border border-border rounded-2xl p-4">{children}</div>
}
