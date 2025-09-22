declare module 'react-grid-layout' {
  import * as React from 'react'
  export type Layout = { i: string; x: number; y: number; w: number; h: number }
  export const Responsive: any
  export const WidthProvider: any
  const RGL: any
  export default RGL
}

declare module 'react-resizable' {
  const resizable: any
  export default resizable
}
