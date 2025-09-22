export type KBState = {
  layoutOrder: string
  stacked: boolean
  mainWidth: number
  rightWidth: number
  asideHeight: number
}

export type KBOptions = { shift?: boolean; alt?: boolean; ctrl?: boolean; meta?: boolean }

// Pure function: given a key, modifier options, id, and current state,
// return a new state object (only fields that changed will reflect new values).
export function computeKeyboardEffects(key: string, options: KBOptions, id: 'main' | 'aside', state: KBState): KBState {
  const step = options.shift ? 40 : 8
  let { layoutOrder, stacked, mainWidth, rightWidth, asideHeight } = state

  if (key === 'ArrowLeft') {
    if (options.meta || options.ctrl) {
      layoutOrder = layoutOrder === 'main-right' ? 'main-left' : 'main-right'
    } else if (options.alt) {
      rightWidth = Math.max(160, rightWidth + step)
    } else {
      mainWidth = Math.max(200, mainWidth - step)
    }
  } else if (key === 'ArrowRight') {
    if (options.meta || options.ctrl) {
      layoutOrder = layoutOrder === 'main-right' ? 'main-left' : 'main-right'
    } else if (options.alt) {
      rightWidth = Math.max(160, rightWidth - step)
    } else {
      mainWidth = Math.max(200, mainWidth + step)
    }
  } else if (key === 'ArrowUp') {
    asideHeight = Math.max(100, asideHeight - step)
  } else if (key === 'ArrowDown') {
    asideHeight = Math.max(100, asideHeight + step)
  } else if (key === 'Enter') {
    stacked = !stacked
  }

  return { layoutOrder, stacked, mainWidth, rightWidth, asideHeight }
}
