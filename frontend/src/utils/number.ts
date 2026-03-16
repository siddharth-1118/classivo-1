export function roundTo(value: number, precision = 2): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function formatNumber(value: number, precision = 2): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  const rounded = roundTo(value, precision);
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(precision);
}

export function formatPercentage(value: number, precision = 2): string {
  if (!Number.isFinite(value)) {
    return (0).toFixed(precision);
  }
  return roundTo(value, precision).toFixed(precision);
}
