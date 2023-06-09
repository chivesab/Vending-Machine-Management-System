export function roundToTwoDecimals(num: number): number {
  return Number((Math.round(num * 100) / 100).toFixed(2));
}