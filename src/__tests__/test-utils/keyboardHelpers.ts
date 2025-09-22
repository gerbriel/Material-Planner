import { computeKeyboardEffects } from '../../lib/keyboard'

export function handleKey(key: string, options: { shift?: boolean; alt?: boolean; ctrl?: boolean; meta?: boolean }, id: 'main' | 'aside', state: { layoutOrder: string; stacked: boolean; mainWidth: number; rightWidth: number; asideHeight: number }) {
  const newState = computeKeyboardEffects(key, options, id, state as any)
  // persist the same keys App would
  try { localStorage.setItem('mbuilder:layoutOrder', newState.layoutOrder) } catch (e) {}
  try { localStorage.setItem('mbuilder:stacked', String(newState.stacked)) } catch (e) {}
  try { localStorage.setItem('mbuilder:mainWidth', String(newState.mainWidth)) } catch (e) {}
  try { localStorage.setItem('mbuilder:rightWidth', String(newState.rightWidth)) } catch (e) {}
  try { localStorage.setItem('mbuilder:asideHeight', String(newState.asideHeight)) } catch (e) {}
  return newState
}
