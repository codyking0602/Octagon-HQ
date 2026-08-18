import {
  BLIND_RESUME_ROUNDS,
  createBlindResumeRounds,
  type BlindResumeRoundSet,
  type BlindResumeStat,
} from "./blindResumeEngine";
import {
  BLIND_RESUME_V3_CONTENT_VERSION,
  blindResumeV3RoundPoints,
  buildOfficialDailySetup,
} from "./todaysChallengeRuntime";

export { blindResumeV3RoundPoints };
export const BLIND_RESUME_V3_GAME_VERSION = BLIND_RESUME_V3_CONTENT_VERSION;

const CASUAL_V3_DAY = "2000-01-01";

type JsonRecord = Record<string, unknown>;

export interface BlindResumeV3Card {
  version: typeof BLIND_RESUME_V3_GAME_VERSION;
  seed: string;
  roundSet: BlindResumeRoundSet;
  revealCounts: number[];
  statsByRound: BlindResumeStat[][];
  difficulties: string[];
}

function record(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function records(value: unknown) {
  return Array.isArray(value)
    ? value.map(record).filter((row): row is JsonRecord => Boolean(row))
    : [];
}

function numberArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => Number.isInteger(item))
    ? value.map(Number)
    : [];
}

function statsForRound(value: unknown): BlindResumeStat[] {
  return records(value).map((stat) => ({
    label: String(stat.label ?? "STAT"),
    valueA: String(stat.value_a ?? "—"),
    valueB: String(stat.value_b ?? "—"),
  }));
}

export function createBlindResumeV3Card(seed: string): BlindResumeV3Card {
  const publication = buildOfficialDailySetup("blind_resume", CASUAL_V3_DAY, seed);
  if (publication.contentVersion !== BLIND_RESUME_V3_CONTENT_VERSION) {
    throw new Error("Blind Resume V3 publication owner returned an unexpected content version.");
  }

  const privateEvidence = record(publication.privateSetupEvidence);
  const generatedSeed = typeof privateEvidence?.seed === "string" ? privateEvidence.seed : "";
  const privateRounds = records(privateEvidence?.rounds);
  const revealCounts = numberArray(record(publication.publicSetup)?.reveal_counts);
  if (!generatedSeed || privateRounds.length !== BLIND_RESUME_ROUNDS || revealCounts.length !== 4) {
    throw new Error("Blind Resume V3 publication owner returned an incomplete card.");
  }

  const generatedRoundSet = createBlindResumeRounds(generatedSeed);
  const statsByRound = privateRounds.map((round, index) => {
    const pair = generatedRoundSet.pairs[index];
    if (
      !pair
      || String(round.pair_id ?? "") !== pair.id
      || String(round.fighter_a_id ?? "") !== pair.fighterA.id
      || String(round.fighter_b_id ?? "") !== pair.fighterB.id
    ) {
      throw new Error(`Blind Resume V3 round ${index + 1} no longer matches the canonical matchup owner.`);
    }
    const stats = statsForRound(round.stats);
    if (stats.length !== 8) {
      throw new Error(`Blind Resume V3 round ${index + 1} must contain eight ordered résumé stats.`);
    }
    return stats;
  });

  return {
    version: BLIND_RESUME_V3_GAME_VERSION,
    seed,
    roundSet: { seed, pairs: generatedRoundSet.pairs },
    revealCounts,
    statsByRound,
    difficulties: privateRounds.map((round) => String(round.difficulty ?? "competitive")),
  };
}

export function storedBlindResumeV3Card(value: unknown): BlindResumeV3Card | null {
  const row = record(value);
  const roundSet = record(row?.roundSet);
  const pairs = Array.isArray(roundSet?.pairs) ? roundSet.pairs : [];
  const revealCounts = numberArray(row?.revealCounts);
  const statsByRound = Array.isArray(row?.statsByRound) ? row.statsByRound : [];
  const difficulties = Array.isArray(row?.difficulties) ? row.difficulties : [];

  if (
    row?.version !== BLIND_RESUME_V3_GAME_VERSION
    || typeof row.seed !== "string"
    || pairs.length !== BLIND_RESUME_ROUNDS
    || revealCounts.length !== 4
    || statsByRound.length !== BLIND_RESUME_ROUNDS
    || statsByRound.some((stats) => !Array.isArray(stats) || stats.length !== 8)
    || difficulties.length !== BLIND_RESUME_ROUNDS
  ) return null;

  return row as unknown as BlindResumeV3Card;
}

export function blindResumeV3FirstRevealCount(card: BlindResumeV3Card) {
  const first = card.revealCounts[0];
  if (!first) throw new Error("Blind Resume V3 card has no opening reveal stage.");
  return first;
}

export function blindResumeV3NextRevealCount(card: BlindResumeV3Card, revealedCount: number) {
  const index = card.revealCounts.indexOf(revealedCount);
  return index >= 0 ? card.revealCounts[index + 1] ?? null : null;
}

export function blindResumeV3ChallengeUrl(seed: string) {
  const url = new URL("/play/blind-resume", window.location.origin);
  url.searchParams.set("challenge", seed);
  url.searchParams.set("v", "3");
  return url.toString();
}
