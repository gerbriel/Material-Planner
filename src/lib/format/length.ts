export function formatFeetToFtIn(feetDecimal: number) {
  const totalInches = Math.round(feetDecimal * 12)
  const ft = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return `${ft}' ${inches}\"`
}

export default formatFeetToFtIn
