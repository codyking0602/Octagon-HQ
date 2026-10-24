import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";
import { CFB_FEUD_REBUILD_CANDIDATES, NFL_FEUD_REBUILD_CANDIDATES } from "./footballSportsFeudRebuildCandidates";

/**
 * FUTURE-ONLY editorial rotation rehearsal, NOT the current Daily publisher.
 * Each call models a fresh rotation cycle for a fixed calendar-independent sequence.
 * We do NOT claim 20 appearances per sport until at least 40 Main + 100 Fast
 * independent topics exist for BOTH NFL and CFB.
 */
export const FOOTBALL_FEUD_REBUILD_VALIDATED_APPEARANCES_PER_SPORT = 10;

function hash(text: string) {
  let result = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    result ^= text.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function lane(question: SportsFeudAuthoredQuestion) {
  return question.collisionGroup ?? question.category;
}

function allocate(
  pool: readonly SportsFeudAuthoredQuestion[],
  reserved: ReadonlySet<string>,
  excludedLanes: ReadonlySet<string>,
  count: number,
  seed: string,
) {
  const eligible = pool.filter((question) => !reserved.has(question.id))
    .sort((left, right) => hash(seed + ":" + left.id) - hash(seed + ":" + right.id)
      || left.id.localeCompare(right.id));
  const selected: SportsFeudAuthoredQuestion[] = [];
  const usedLanes = new Set(excludedLanes);
  for (const question of eligible) {
    if (usedLanes.has(lane(question))) continue;
    selected.push(question);
    usedLanes.add(lane(question));
    if (selected.length === count) return selected;
  }
  throw new Error("Insufficient distinct Football Sports Feud editorial topics; add content before activation.");
}

export function previewFootballFeudRebuildRotation(
  sport: "nfl" | "cfb",
  appearances = FOOTBALL_FEUD_REBUILD_VALIDATED_APPEARANCES_PER_SPORT,
) {
  if (!Number.isSafeInteger(appearances) || appearances < 1
    || appearances > FOOTBALL_FEUD_REBUILD_VALIDATED_APPEARANCES_PER_SPORT) {
    throw new Error("Rebuild preview exceeds the audited question inventory.");
  }
  const bank = sport === "nfl" ? NFL_FEUD_REBUILD_CANDIDATES : CFB_FEUD_REBUILD_CANDIDATES;
  const usedMain = new Set<string>();
  const usedFast = new Set<string>();
  const output: { main: SportsFeudAuthoredQuestion[]; fast: SportsFeudAuthoredQuestion[] }[] = [];
  for (let slot = 0; slot < appearances; slot += 1) {
    const main = allocate(bank.main, usedMain, new Set<string>(), 2, sport + ":main:" + slot);
    const fast = allocate(bank.fast, usedFast, new Set(main.map(lane)), 5, sport + ":fast:" + slot);
    main.forEach((question) => usedMain.add(question.id));
    fast.forEach((question) => usedFast.add(question.id));
    output.push({ main, fast });
  }
  return output;
}
