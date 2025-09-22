export function ftInchesString(feet: number) {
  const f = Math.floor(feet)
  const inches = Math.round((feet - f) * 12)
  return `${f}' ${inches}\"`
}
