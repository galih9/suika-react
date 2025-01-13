// generate random round number
export const generateNumber = (arg?: { from?: number, to?: number } | number): number => {
  let from = 0, to = 10;
  if (typeof arg === 'number') {
    to = arg;
  } else if (typeof arg === 'object') {
    from = arg.from ?? 0;
    to = arg.to ?? 10;
  }
  if (typeof from !== 'number' || typeof to !== 'number') {
    return 0
  }
  if (from > to) {
    return 0
  }
  return Math.floor(Math.random() * (to - from + 1)) + from
}
