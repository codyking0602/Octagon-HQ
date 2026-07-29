import { rankedPlayFighters, type PlayGender, type RankedPlayFighter } from "./playFighterPool";
import { createReplaySeed, seededLineupRandom } from "./lineupModel";

export const BLIND_RESUME_ROUNDS = 5;

export interface BlindResumePair {
  id: string;
  fighterA: RankedPlayFighter;
  fighterB: RankedPlayFighter;
  gender: PlayGender;
  scoreGap: number;
  band: "close" | "stretch" | "wildcard";
}

export interface BlindResumeRoundSet {
  seed: string;
  pairs: BlindResumePair[];
}

export interface BlindResumeStat {
  label: string;
  valueA: string;
  valueB: string;
}

function weightedPick<T>(rows: readonly T[], weight: (row: T) => number, random: () => number) {
  const weighted = rows.map((row) => ({ row, weight: Math.max(0.0001, weight(row)) }));
  let cursor = random() * weighted.reduce((sum, item) => sum + item.weight, 0);
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) return item.row;
  }
  return weighted.at(-1)!.row;
}

function chooseBand(random: () => number): BlindResumePair["band"] {
  const roll = random();
  if (roll < 0.72) return "close";
  if (roll < 0.96) return "stretch";
  return "wildcard";
}

const bandTarget = {
  close: { min: 0, max: 3, target: 1.5 },
  stretch: { min: 3, max: 6, target: 4.5 },
  wildcard: { min: 6, max: 9, target: 7.5 },
} as const;

function inBand(gap: number, band: BlindResumePair["band"]) {
  const limits = bandTarget[band];
  return limits.min === 0 ? gap <= limits.max : gap > limits.min && gap <= limits.max;
}

function pickGender(round: number, womenUsed: boolean, random: () => number): PlayGender {
  if (womenUsed) return "men";
  if (round === BLIND_RESUME_ROUNDS - 1 && random() < 0.35) return "women";
  return random() < 0.18 ? "women" : "men";
}

export function createBlindResumeSeed() {
  return createReplaySeed("blind-resume");
}

export function createBlindResumeRounds(seed: string): BlindResumeRoundSet {
  const random = seededLineupRandom("blind-resume", seed);
  const usedNames = new Set<string>();
  const usedPairs = new Set<string>();
  const appearances = new Map<string, number>();
  const pairs: BlindResumePair[] = [];
  let womenUsed = false;

  for (let round = 0; round < BLIND_RESUME_ROUNDS; round += 1) {
    const gender = pickGender(round, womenUsed, random);
    const pool = rankedPlayFighters.filter((fighter) => fighter.gender === gender);
    const band = chooseBand(random);
    const available = pool.filter((fighter) => !usedNames.has(fighter.id));
    const anchors = available.length >= 2 ? available : pool;
    const anchor = weightedPick(anchors, (fighter) => 1 / Math.pow(1 + (appearances.get(fighter.id) ?? 0), 2), random);
    const candidates = pool.filter((fighter) => {
      if (fighter.id === anchor.id || usedNames.has(fighter.id)) return false;
      const key = [anchor.id, fighter.id].sort().join("|");
      return !usedPairs.has(key) && inBand(Math.abs(anchor.model.rawScore - fighter.model.rawScore), band);
    });
    const fallback = pool
      .filter((fighter) => fighter.id !== anchor.id && !usedNames.has(fighter.id))
      .sort((left, right) => Math.abs(anchor.model.rawScore - left.model.rawScore) - Math.abs(anchor.model.rawScore - right.model.rawScore));
    const options = candidates.length ? candidates : fallback;
    const opponent = weightedPick(options, (fighter) => {
      const gap = Math.abs(anchor.model.rawScore - fighter.model.rawScore);
      const fit = 1 / (1 + Math.abs(gap - bandTarget[band].target));
      return fit / Math.pow(1 + (appearances.get(fighter.id) ?? 0), 2);
    }, random);
    const [fighterA, fighterB] = random() < 0.5 ? [anchor, opponent] : [opponent, anchor];
    const pairKey = [anchor.id, opponent.id].sort().join("|");
    usedPairs.add(pairKey);
    usedNames.add(anchor.id);
    usedNames.add(opponent.id);
    appearances.set(anchor.id, (appearances.get(anchor.id) ?? 0) + 1);
    appearances.set(opponent.id, (appearances.get(opponent.id) ?? 0) + 1);
    womenUsed ||= gender === "women";
    pairs.push({
      id: `round-${round + 1}-${pairKey}`,
      fighterA,
      fighterB,
      gender,
      scoreGap: Math.abs(anchor.model.rawScore - opponent.model.rawScore),
      band,
    });
  }

  return { seed, pairs };
}

export function blindResumeWinner(pair: BlindResumePair) {
  if (pair.fighterA.model.rank === pair.fighterB.model.rank) {
    return pair.fighterA.model.rawScore >= pair.fighterB.model.rawScore ? pair.fighterA : pair.fighterB;
  }
  return pair.fighterA.model.rank < pair.fighterB.model.rank ? pair.fighterA : pair.fighterB;
}

function formatNumber(value: number, digits = 0) {
  return value.toFixed(digits).replace(/\.0$/, "");
}

function apexRating(fighter: RankedPlayFighter) {
  return Math.max(55, Math.min(99, Math.round(55 + (fighter.model.apexPeak / 6) * 44)));
}

export function blindResumeStats(pair: BlindResumePair): BlindResumeStat[] {
  const a = pair.fighterA.model.visibleStats;
  const b = pair.fighterB.model.visibleStats;
  return [
    { label: "UFC title-fight wins", valueA: formatNumber(a.titleFightWins), valueB: formatNumber(b.titleFightWins) },
    { label: "Top-5 wins", valueA: formatNumber(a.topFiveWins), valueB: formatNumber(b.topFiveWins) },
    { label: "Prime UFC record", valueA: a.primeRecord, valueB: b.primeRecord },
    { label: "Main UFC era", valueA: pair.fighterA.mainEra, valueB: pair.fighterB.mainEra },
    { label: "Apex rating", valueA: String(apexRating(pair.fighterA)), valueB: String(apexRating(pair.fighterB)) },
    { label: "Rounds won", valueA: `${formatNumber(a.roundsWonPct, 1)}%`, valueB: `${formatNumber(b.roundsWonPct, 1)}%` },
    { label: "Finish rate", valueA: `${formatNumber(a.finishRatePct, 1)}%`, valueB: `${formatNumber(b.finishRatePct, 1)}%` },
    { label: "Active elite years", valueA: formatNumber(a.activeEliteYears, 1), valueB: formatNumber(b.activeEliteYears, 1) },
  ];
}

export function blindResumeTier(score: number) {
  if (score === 5) return "GOAT Scholar";
  if (score === 4) return "Elite Eye";
  if (score === 3) return "Contender";
  if (score === 2) return "Casual Allegations";
  return "Dana Needs to See You";
}

export function blindResumeChallengeUrl(seed: string) {
  const url = new URL("/play/blind-resume", window.location.origin);
  url.searchParams.set("challenge", seed);
  return url.toString();
}
