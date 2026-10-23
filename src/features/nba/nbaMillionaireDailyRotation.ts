import type { MillionaireRun } from "../games/millionaireEngine";
import { createNbaMillionaireRun } from "./nbaMillionaireBank";

/**
 * Canonical NBA Millionaire publication sequence; never uses the Casual
 * localStorage history or seeded Owner Preview.
 */
export const NBA_MILLIONAIRE_UNIQUE_APPEARANCES = 20;

const cached = new Map<number, readonly MillionaireRun[]>();
function buildCycle(cycle: number) {
  const used = new Set<string>();
  const result: MillionaireRun[] = [];
  for (let index = 0; index < NBA_MILLIONAIRE_UNIQUE_APPEARANCES; index++) {
    const run = createNbaMillionaireRun(
      `nba-official-millionaire-v1|${cycle}|${index}`,
      [...used],
    );
    for (const question of run) {
      if (used.has(question.id)) {
        throw new Error("NBA Millionaire Daily cannot repeat a question within the 20-run window.");
      }
      used.add(question.id);
    }
    result.push(run);
  }
  return result;
}
export function buildNbaOfficialMillionaireRun(appearanceIndex: number): MillionaireRun {
  if (!Number.isSafeInteger(appearanceIndex) || appearanceIndex < 0) {
    throw new Error("NBA Millionaire appearance index must be nonnegative.");
  }
  const cycle = Math.floor(appearanceIndex / NBA_MILLIONAIRE_UNIQUE_APPEARANCES);
  let runs = cached.get(cycle);
  if (!runs) {
    runs = buildCycle(cycle);
    cached.set(cycle, runs);
  }
  return runs[appearanceIndex % NBA_MILLIONAIRE_UNIQUE_APPEARANCES]!;
}
