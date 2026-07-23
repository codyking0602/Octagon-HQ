import type { CanonicalFight, FighterEraWindow } from "./schemas";

const ONE_DAY_MS = 86_400_000;

function nearestDate(
  fights: readonly CanonicalFight[],
  targetDate: string,
): string | null {
  const exact = fights.find((fight) => fight.date === targetDate);
  if (exact) return exact.date;

  const target = Date.parse(`${targetDate}T00:00:00Z`);
  let nearest: { date: string; distance: number } | null = null;
  fights.forEach((fight) => {
    const distance = Math.abs(Date.parse(`${fight.date}T00:00:00Z`) - target);
    if (!nearest || distance < nearest.distance) nearest = { date: fight.date, distance };
  });

  return nearest && nearest.distance <= ONE_DAY_MS ? nearest.date : null;
}

export function resolveEraWindow(
  fights: readonly CanonicalFight[],
  window: FighterEraWindow,
): FighterEraWindow {
  const start = nearestDate(fights, window.start);
  const end = window.end ? nearestDate(fights, window.end) : null;
  if (!start || (window.end && !end)) {
    throw new Error(`Unable to resolve era window ${window.start} through ${window.end ?? "open"}.`);
  }
  return { start, end };
}
