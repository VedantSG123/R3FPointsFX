export const nextPerfectSquare = (input: number): number => {
  if (input < 0) return 0
  const sqrt = Math.ceil(Math.sqrt(input))
  return sqrt * sqrt
}
