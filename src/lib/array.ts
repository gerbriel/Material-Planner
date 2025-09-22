export function reorder<T>(list: T[], from: number, to: number): T[] {
  const copy = list.slice()
  const [moved] = copy.splice(from, 1)
  copy.splice(to, 0, moved)
  return copy
}
