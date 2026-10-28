import type { RankingFighter } from "../rankings/rankingModel";

const DAY_MS = 86_400_000;
const ROTATION_EPOCH = "2026-08-06";
const ROTATION_SEED_VERSION = "octagon-hq-ranking-spotlight-v1";
const SPOTLIGHT_OVERRIDES = [
  { day: "2026-08-15", fighterSlug: "khamzat-chimaev" },
] as const;

function rankingDayNumber(day: string) {
  const timestamp = Date.parse(`${day}T12:00:00Z`);
  return Number.isFinite(timestamp) ? Math.floor(timestamp / DAY_MS) : 0;
}

function hashText(value: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function shuffledCycle(
  fighters: readonly RankingFighter[],
  cycle: number,
) {
  const shuffled = fighters
    .slice()
    .sort((left, right) => left.slug.localeCompare(right.slug));
  const rosterKey = shuffled.map((fighter) => fighter.slug).join("|");
  const random = seededRandom(
    hashText(`${ROTATION_SEED_VERSION}|${rosterKey}|${cycle}`),
  );

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function spotlightCycle(
  fighters: readonly RankingFighter[],
  cycle: number,
) {
  const current = shuffledCycle(fighters, cycle);
  if (current.length <= 2) return current;

  const previous = shuffledCycle(fighters, cycle - 1);
  if (current[0]?.slug === previous.at(-1)?.slug) {
    [current[0], current[1]] = [current[1], current[0]];
  }
  return current;
}

function spotlightCycleWithOverrides(
  fighters: readonly RankingFighter[],
  cycle: number,
) {
  const current = spotlightCycle(fighters, cycle);
  if (!current.length) return current;

  for (const override of SPOTLIGHT_OVERRIDES) {
    const relativeDay = rankingDayNumber(override.day) - rankingDayNumber(ROTATION_EPOCH);
    const overrideCycle = Math.floor(relativeDay / current.length);
    if (overrideCycle !== cycle) continue;

    const overridePosition = ((relativeDay % current.length) + current.length) % current.length;
    const fighterPosition = current.findIndex((fighter) => fighter.slug === override.fighterSlug);
    if (fighterPosition < 0 || fighterPosition === overridePosition) continue;

    [current[overridePosition], current[fighterPosition]] = [
      current[fighterPosition],
      current[overridePosition],
    ];
  }

  return current;
}

export function dailyRankingSpotlight(
  fighters: readonly RankingFighter[],
  day: string,
) {
  if (!fighters.length) return null;

  const relativeDay = rankingDayNumber(day) - rankingDayNumber(ROTATION_EPOCH);
  const cycle = Math.floor(relativeDay / fighters.length);
  const position = ((relativeDay % fighters.length) + fighters.length) % fighters.length;
  return spotlightCycleWithOverrides(fighters, cycle)[position] ?? null;
}
