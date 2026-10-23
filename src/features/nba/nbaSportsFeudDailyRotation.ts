import { buildNbaSportsFeudPack } from "./nbaSportsFeudBank";
import type { FamilyFeudPack } from "../games/familyFeudEngine";

/**
 * NBA Sports Feud belongs to official Daily Challenges, NOT Casual.
 * A "slot" is an occurrence of NBA Sports Feud in the published NBA Daily
 * schedule, not a calendar day or an individual player's attempt.
 *
 * Every player receives the same seven boards for the same official slot.
 * The first 20 appearances within a cycle cannot repeat either Main or Fast
 * questions; every appearance has two Main plus five Fast. No account-backed
 * reservation, browser storage, or random-per-player seeding is involved.
 *
 * Publishers must pass the zero-based ordinal of an NBA Sports Feud Daily
 * appearance. Once the NBA Daily schedule exists, derive this ordinal from
 * that schedule; do not count calendar days or assume a frequency.
 */
export const NBA_SPORTS_FEUD_DAILY_UNIQUE_SLOTS = 20;

const rotations = new Map<number, readonly FamilyFeudPack[]>();

function buildCycle(cycle: number): readonly FamilyFeudPack[] {
  const usedMain = new Set<string>();
  const usedFast = new Set<string>();
  const packs: FamilyFeudPack[] = [];
  for (let slot = 0; slot < NBA_SPORTS_FEUD_DAILY_UNIQUE_SLOTS; slot += 1) {
    let chosen: FamilyFeudPack | undefined;
    for (let attempt = 0; attempt < 128; attempt += 1) {
      const seed = `daily-rotation-v1:${cycle}:${slot}:${attempt}`;
      try {
        chosen = buildNbaSportsFeudPack(seed, { main: usedMain, fast: usedFast });
        break;
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("insufficient distinct editorial topics")) {
          throw error;
        }
      }
    }
    if (!chosen) {
      throw new Error(`NBA Daily Sports Feud has no repeat-free board for appearance ${slot}.`);
    }
    for (const board of chosen.mainBoards) usedMain.add(board.id.replace(/^nba-feud-/, ""));
    for (const board of chosen.fastMoney) usedFast.add(board.id.replace(/^nba-feud-/, ""));
    packs.push(chosen);
  }
  return packs;
}

export function buildNbaSportsFeudDailyPack(appearanceIndex: number): FamilyFeudPack {
  if (!Number.isSafeInteger(appearanceIndex) || appearanceIndex < 0) {
    throw new Error("NBA Sports Feud Daily appearance index must be a nonnegative integer.");
  }
  const cycle = Math.floor(appearanceIndex / NBA_SPORTS_FEUD_DAILY_UNIQUE_SLOTS);
  let packs = rotations.get(cycle);
  if (!packs) {
    packs = buildCycle(cycle);
    rotations.set(cycle, packs);
  }
  return packs[appearanceIndex % NBA_SPORTS_FEUD_DAILY_UNIQUE_SLOTS]!;
}
