export function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, Number(value || 0)));
}

export function round1(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 10) / 10;
}

export function round2(value: number) {
  const rounded = Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function round6(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 1_000_000) / 1_000_000;
}
