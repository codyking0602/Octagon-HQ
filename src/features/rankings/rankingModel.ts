import { fighterAsset } from "../../config/brand";
import { canonicalRankingInputs, type RankingInputFighter } from "./data/rankingInputs";
import {
  calculateApex,
  calculateChampionship,
  calculateEraDepth,
  calculateLongevity,
  calculateLossContext,
  calculateOpponentQuality,
  calculatePrimeDominance,
} from "./engine/categoryCalculators";
import { resolveEraWindow } from "./engine/eraWindow";
import { round2 } from "./engine/math";
import {
  buildRankingProjection,
  type BaseCategoryScores,
  type RankingModifiers,
} from "./engine/rankingEngine";
import { v1ProductionRankingParityFixture } from "./engine/parityFixture";
import type { CanonicalFight, RankingBoard } from "./engine/schemas";

const LEGACY_APP_ROOT = "https://codyking0602.github.io/ufc-goat-rankings/";
const FINISH_METHODS = new Set(["ko-tko", "submission", "doctor-stoppage"]);
const TOP_FIVE_TIERS = new Set(["champion-level", "top-five"]);
const RANKED_TIERS = new Set(["champion-level", "top-five", "top-ten", "ranked"]);

const CHAMPIONSHIP_TYPES: Record<
  string,
  { baseCredit: number; officialTitleFight: boolean }
> = {
  none: { baseCredit: 0, officialTitleFight: false },
  normal: { baseCredit: 1, officialTitleFight: true },
  interim: { baseCredit: 0.75, officialTitleFight: true },
  "vacant-undisputed": { baseCredit: 0.9, officialTitleFight: true },
  "second-division-undisputed": { baseCredit: 1.25, officialTitleFight: true },
  "vacant-second-division": { baseCredit: 1.15, officialTitleFight: true },
  tournament: { baseCredit: 0, officialTitleFight: false },
  "retention-draw": { baseCredit: 0, officialTitleFight: true },
};

interface DispositionCounts {
  wins: number;
  losses: number;
  draws: number;
  noContests: number;
  technicalExceptions: number;
}

export interface RankingVisibleStats {
  ufcRecord: string;
  titleFightWins: number;
  adjustedTitleWins: number;
  topFiveWins: number;
  rankedWins: number;
  finishRatePct: number;
  primeRecord: string;
  roundsWonPct: number;
  activeEliteYears: number;
  timesFinishedPrime: number;
  throughPrimeUfcFights: number;
}

interface CalculationMetadata {
  input: RankingInputFighter;
  traces: {
    championship: ReturnType<typeof calculateChampionship>;
    opponentQuality: ReturnType<typeof calculateOpponentQuality>;
    primeDominance: ReturnType<typeof calculatePrimeDominance>;
    longevity: ReturnType<typeof calculateLongevity>;
    apex: ReturnType<typeof calculateApex>;
    penalty: ReturnType<typeof calculateLossContext>;
    eraDepth: ReturnType<typeof calculateEraDepth>;
  };
  visibleStats: RankingVisibleStats;
}

export interface RankingFighter {
  fighter: string;
  name: string;
  slug: string;
  board: RankingBoard;
  rank: number;
  ovr: number;
  rawScore: number;
  division: string;
  primaryDivision: string;
  secondaryDivision: string;
  resumeTag: string;
  oneLiner: string;
  whyRankedHere: string;
  whyNotHigher: string;
  finalTakeaway: string;
  judgmentCalls: string[];
  divisionStrength: string;
  thumbUrl: string;
  profileUrl: string;
  championship: number;
  opponentQuality: number;
  primeDominance: number;
  longevity: number;
  apexPeak: number;
  penalty: number;
  eraDepth: number;
  visibleStats: RankingVisibleStats;
  traces: CalculationMetadata["traces"];
}

function countDispositions(fights: readonly CanonicalFight[]): DispositionCounts {
  return fights.reduce<DispositionCounts>(
    (counts, fight) => {
      if (fight.officialResult === "no-contest") counts.noContests += 1;
      if (fight.scoringDisposition === "count-win") counts.wins += 1;
      else if (fight.scoringDisposition === "count-loss") counts.losses += 1;
      else if (fight.scoringDisposition === "count-draw") counts.draws += 1;
      else if (fight.scoringDisposition === "technical-exception") {
        counts.technicalExceptions += 1;
      }
      return counts;
    },
    { wins: 0, losses: 0, draws: 0, noContests: 0, technicalExceptions: 0 },
  );
}

function formatRecord(counts: DispositionCounts, includeNoContest = true) {
  const base = `${counts.wins}-${counts.losses}${counts.draws ? `-${counts.draws}` : ""}`;
  return includeNoContest && counts.noContests
    ? `${base}, ${counts.noContests} NC`
    : base;
}

function canonicalPrimeFights(input: RankingInputFighter) {
  const fights = input.facts.fights;
  const start = fights.findIndex((fight) => fight.id === input.facts.primeWindow.startFightId);
  const end = input.facts.primeWindow.open
    ? fights.length - 1
    : fights.findIndex((fight) => fight.id === input.facts.primeWindow.endFightId);
  if (start < 0 || end < start) {
    throw new Error(`Canonical prime window is invalid for ${input.fighter}.`);
  }
  return { fights: fights.slice(start, end + 1), start, end };
}

function championshipCredit(fight: CanonicalFight) {
  if (
    fight.championshipManualCredit !== undefined &&
    fight.championshipManualCredit !== null
  ) {
    return Number(fight.championshipManualCredit) || 0;
  }
  if (fight.scoringDisposition !== "count-win" || fight.championshipEligible === false) {
    return 0;
  }
  const rule = CHAMPIONSHIP_TYPES[fight.championshipType] ?? CHAMPIONSHIP_TYPES.none;
  return rule.baseCredit * Number(fight.championshipOpponentStrength || 0);
}

function activeEliteYears(input: RankingInputFighter, primeFights: readonly CanonicalFight[]) {
  const dates = primeFights.map((fight) => Date.parse(`${fight.date}T00:00:00Z`));
  if (!dates.length) return 0;
  const capDays = input.facts.gapCapMonths * 30.4375;
  let days = 0;
  for (let index = 1; index < dates.length; index += 1) {
    days += Math.min((dates[index] - dates[index - 1]) / 86_400_000, capDays);
  }
  if (input.facts.primeWindow.open) {
    const asOf = Date.parse(`${canonicalRankingInputs.source.modelAsOfDate}T00:00:00Z`);
    const lastDate = dates.at(-1)!;
    if (asOf > lastDate) days += Math.min((asOf - lastDate) / 86_400_000, capDays);
  }
  return round2(days / 365.25);
}

function deriveVisibleStats(input: RankingInputFighter): RankingVisibleStats {
  const fights = input.facts.fights;
  const official = fights.reduce<DispositionCounts>(
    (counts, fight) => {
      if (fight.officialResult === "win") counts.wins += 1;
      else if (fight.officialResult === "loss") counts.losses += 1;
      else if (fight.officialResult === "draw") counts.draws += 1;
      else if (fight.officialResult === "no-contest") counts.noContests += 1;
      return counts;
    },
    { wins: 0, losses: 0, draws: 0, noContests: 0, technicalExceptions: 0 },
  );
  const scored = countDispositions(fights);
  const finishWins = fights.filter(
    (fight) =>
      fight.scoringDisposition === "count-win" && FINISH_METHODS.has(fight.methodCategory),
  ).length;
  const prime = canonicalPrimeFights(input);
  const primeCounts = countDispositions(prime.fights);
  const timesFinishedPrime = prime.fights.filter(
    (fight) =>
      fight.scoringDisposition === "count-loss" && FINISH_METHODS.has(fight.methodCategory),
  ).length;
  const rounds = prime.fights.reduce(
    (totals, fight) => {
      if (fight.rounds.status !== "audited") return totals;
      totals.won += fight.rounds.won;
      totals.lost += fight.rounds.lost;
      totals.drawn += fight.rounds.drawn;
      return totals;
    },
    { won: 0, lost: 0, drawn: 0 },
  );
  const roundTotal = rounds.won + rounds.lost + rounds.drawn;
  const titleFightWins = fights.filter((fight) => {
    const rule = CHAMPIONSHIP_TYPES[fight.championshipType] ?? CHAMPIONSHIP_TYPES.none;
    return (
      rule.officialTitleFight &&
      fight.championshipEligible !== false &&
      fight.scoringDisposition === "count-win"
    );
  }).length;
  const adjustedTitleWins = round2(
    fights.reduce((total, fight) => total + championshipCredit(fight), 0),
  );
  const qualityWins = fights.filter((fight) => fight.scoringDisposition === "count-win");
  const throughPrime = countDispositions(fights.slice(0, prime.end + 1));

  return {
    ufcRecord: formatRecord(official),
    titleFightWins,
    adjustedTitleWins,
    topFiveWins: qualityWins.filter((fight) => TOP_FIVE_TIERS.has(fight.qualityTier)).length,
    rankedWins: qualityWins.filter((fight) => RANKED_TIERS.has(fight.qualityTier)).length,
    finishRatePct: scored.wins ? round2((finishWins / scored.wins) * 100) : 0,
    primeRecord: formatRecord(primeCounts),
    roundsWonPct: roundTotal
      ? round2(((rounds.won + rounds.drawn * 0.5) / roundTotal) * 100)
      : 0,
    activeEliteYears: activeEliteYears(input, prime.fights),
    timesFinishedPrime,
    throughPrimeUfcFights: throughPrime.wins + throughPrime.losses + throughPrime.draws,
  };
}

function resolveAsset(path: string | null, slug: string, kind: "thumb" | "profile") {
  if (!path) return fighterAsset(slug, kind);
  if (/^https?:\/\//i.test(path)) return path;
  return `${LEGACY_APP_ROOT}${path.replace(/^\/+/, "")}`;
}

function divisionStrengthCopy(input: RankingInputFighter, eraDepth: number) {
  const multiplier = round2(input.era.divisionMultiplier);
  const direction = eraDepth > 0 ? "adds" : eraDepth < 0 ? "reduces" : "keeps";
  return `The shared UFC era ledger applies a ${multiplier.toFixed(2)} division multiplier, while the approved era-depth adjustment ${direction} ${Math.abs(eraDepth).toFixed(2)} points to the final score.`;
}

const contract = v1ProductionRankingParityFixture.contract;

const calculationSeeds = canonicalRankingInputs.fighters.map((input) => {
  const eraWindow = resolveEraWindow(input.facts.fights, input.era.window);
  const championship = calculateChampionship(input.judgments.championship);
  const opponentQuality = calculateOpponentQuality(input.judgments.opponentQuality);
  const primeDominance = calculatePrimeDominance({
    fighter: input.fighter,
    fights: input.facts.fights,
    window: eraWindow,
  });
  const longevity = calculateLongevity({
    fighter: input.fighter,
    fights: input.facts.fights,
    window: eraWindow,
    modelAsOfDate: canonicalRankingInputs.source.modelAsOfDate,
    statusMultiplier: input.era.statusMultiplier,
    divisionMultiplier: input.era.divisionMultiplier,
  });
  const apex = calculateApex(input.judgments.apex);
  const penalty = calculateLossContext({
    fighter: input.fighter,
    fights: input.facts.fights,
    window: eraWindow,
    divisionMultiplier: input.era.divisionMultiplier,
  });
  const eraDepth = calculateEraDepth(input.eraDepth);
  const categories: BaseCategoryScores = {
    championship: championship.score,
    opponentQuality: opponentQuality.score,
    primeDominance: primeDominance.score,
    longevity: longevity.score,
  };
  const modifiers: RankingModifiers = {
    apex: apex.score,
    penalty: penalty.penalty,
    eraDepth: eraDepth.adjustment,
  };
  const metadata: CalculationMetadata = {
    input,
    traces: { championship, opponentQuality, primeDominance, longevity, apex, penalty, eraDepth },
    visibleStats: deriveVisibleStats(input),
  };
  return { fighter: input.fighter, board: input.board, categories, modifiers, metadata };
});

export const calculatedRankingProjection = buildRankingProjection(calculationSeeds, contract);

function appRow(
  row: (typeof calculatedRankingProjection.rows)[number],
): RankingFighter {
  const metadata = row.metadata!;
  const presentation = metadata.input.presentation;
  return {
    fighter: row.fighter,
    name: row.fighter,
    slug: presentation.slug,
    board: row.board,
    rank: row.rank,
    ovr: row.ovr,
    rawScore: row.totals.totalScore,
    division: presentation.divisionLabel,
    primaryDivision: presentation.primaryDivision ?? metadata.input.facts.identity.primaryDivision,
    secondaryDivision:
      presentation.secondaryDivision ?? metadata.input.facts.identity.secondaryDivisions.join(" / "),
    resumeTag: presentation.resumeTag,
    oneLiner: presentation.oneLiner,
    whyRankedHere: presentation.whyRankedHere,
    whyNotHigher: presentation.whyNotHigher,
    finalTakeaway: presentation.finalTakeaway,
    judgmentCalls: presentation.keyJudgmentCalls,
    divisionStrength: divisionStrengthCopy(metadata.input, row.modifiers.eraDepth),
    thumbUrl: resolveAsset(presentation.thumbUrl, presentation.slug, "thumb"),
    profileUrl: resolveAsset(presentation.photoUrl, presentation.slug, "profile"),
    championship: row.categories.championship,
    opponentQuality: row.categories.opponentQuality,
    primeDominance: row.categories.primeDominance,
    longevity: row.categories.longevity,
    apexPeak: row.modifiers.apex,
    penalty: row.modifiers.penalty,
    eraDepth: row.modifiers.eraDepth,
    visibleStats: metadata.visibleStats,
    traces: metadata.traces,
  };
}

export const allTime = calculatedRankingProjection.rows.map(appRow);
export const menAllTime = calculatedRankingProjection.men.map(appRow);
export const womenAllTime = calculatedRankingProjection.women.map(appRow);

const fightersBySlug = new Map(allTime.map((fighter) => [fighter.slug, fighter]));

export function getFighter(slug?: string) {
  return slug ? fightersBySlug.get(slug) : undefined;
}

export function categoryRating(value: number, maximum = 30) {
  return Math.max(0, Math.min(99, Math.round((value / maximum) * 99)));
}
