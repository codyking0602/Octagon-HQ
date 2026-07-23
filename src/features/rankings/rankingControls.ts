import { canonicalRankingInputs, type RankingEra, type RankingInputFighter } from "./data/rankingInputs";
import { round2 } from "./engine/math";
import {
  calculatedRankingProjection,
  menAllTime,
  womenAllTime,
  type RankingFighter,
} from "./rankingModel";

export const rankingViewOptions = [
  { value: "p4p", label: "P4P" },
  { value: "women", label: "Women" },
  { value: "division", label: "Divisions" },
  { value: "category", label: "Categories" },
] as const;

export type RankingView = (typeof rankingViewOptions)[number]["value"];
export type CategoryGender = "men" | "women";

export const rankingCategoryOptions = [
  {
    value: "championship",
    label: "Championship Resume",
    description: "UFC title-level accomplishment, weighted title wins, and championship control.",
  },
  {
    value: "opponentQuality",
    label: "Opponent Quality Wins",
    description: "Quality of UFC wins, with extra weight on elite opponents and prime victories.",
  },
  {
    value: "primeDominance",
    label: "Prime Dominance",
    description: "How strongly a fighter controlled their prime through wins, rounds, finishes, and separation.",
  },
  {
    value: "longevity",
    label: "Elite Longevity",
    description: "How long a fighter stayed elite in the UFC at a high competitive level.",
  },
  {
    value: "apexPeak",
    label: "Peak Apex",
    description: "How high the fighter's best two-performance UFC peak reached.",
  },
  {
    value: "penalty",
    label: "Loss Context",
    description: "How damaging UFC losses were after timing, opponent, finish, and division context.",
  },
] as const;

export type RankingCategory = (typeof rankingCategoryOptions)[number]["value"];

export const DIVISION_RESUME_SHARE_MIN = 10;
export const divisionOrder = [
  "Heavyweight",
  "Light Heavyweight",
  "Middleweight",
  "Welterweight",
  "Lightweight",
  "Featherweight",
  "Bantamweight",
  "Flyweight",
  "Openweight",
] as const;

export type RankingDivision = (typeof divisionOrder)[number];

const divisionLabels: Partial<Record<RankingDivision, string>> = {
  Openweight: "Openweight (Historical)",
};

const divisionAliases: Record<string, RankingDivision> = {
  heavyweight: "Heavyweight",
  hw: "Heavyweight",
  "light heavyweight": "Light Heavyweight",
  lhw: "Light Heavyweight",
  middleweight: "Middleweight",
  mw: "Middleweight",
  welterweight: "Welterweight",
  ww: "Welterweight",
  lightweight: "Lightweight",
  lw: "Lightweight",
  featherweight: "Featherweight",
  fw: "Featherweight",
  bantamweight: "Bantamweight",
  bw: "Bantamweight",
  flyweight: "Flyweight",
  flw: "Flyweight",
  openweight: "Openweight",
  "open weight": "Openweight",
};

const SCORED_DISPOSITIONS = new Set(["count-win", "count-loss", "count-draw"]);
const FINISH_METHODS = new Set(["ko-tko", "submission", "doctor-stoppage"]);
const ELITE_TIERS = new Set(["champion-level", "top-five"]);
const RANKED_TIERS = new Set(["champion-level", "top-five", "top-ten", "ranked"]);
const OFFICIAL_TITLE_TYPES = new Set([
  "normal",
  "interim",
  "vacant-undisputed",
  "second-division-undisputed",
  "vacant-second-division",
  "retention-draw",
]);

interface EvidenceRow {
  fightId?: string;
  opponent?: string;
  label?: string;
  date?: string;
  finalAdjustedCredit?: number;
  adjustedCredit?: number;
  credit?: number;
  countedCredit?: number;
  finalCredit?: number;
  rating?: number;
  rawPenalty?: number;
  total?: number;
  base?: number;
  finishExtra?: number;
}

export interface DivisionVisibleStats {
  ufcRecord: string;
  ufcFightCount: number;
  ufcWins: number;
  ufcLosses: number;
  ufcDraws: number;
  ufcNoContests: number;
  titleFightWins: number;
  adjustedTitleWins: number;
  topFiveWins: number;
  rankedWins: number;
  finishRatePct: number;
  primeRecord: string;
  roundsWonPct: number;
  activeEliteYears: number;
}

export interface DivisionRankingRow {
  fighter: RankingFighter;
  division: RankingDivision;
  divisionLabel: string;
  role: "primary" | "secondary" | "crossover";
  rankEligible: boolean;
  rank: number;
  divisionScore: number;
  resumeSharePct: number;
  components: {
    championship: number;
    opponentQuality: number;
    primeDominance: number;
    longevity: number;
    apex: number;
    penalty: number;
    eraDepth: number;
  };
  stats: DivisionVisibleStats;
}

export interface DivisionRankingReport {
  passed: boolean;
  allocationOwner: "canonical fight-level division evidence";
  eligibilityRule: "at least one UFC win in the division";
  minimumResumeSharePct: number;
  rows: DivisionRankingRow[];
  boards: Partial<Record<RankingDivision, DivisionRankingRow[]>>;
  conservation: Array<{
    fighter: string;
    allocated: number;
    expected: number;
    difference: number;
  }>;
}

const inputByFighter = new Map(
  canonicalRankingInputs.fighters.map((input) => [input.fighter, input]),
);
const projectionByFighter = new Map(
  calculatedRankingProjection.rows.map((row) => [row.fighter, row]),
);

function normalizedKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function divisionLabel(division: RankingDivision) {
  return divisionLabels[division] ?? division;
}

function canonicalDivision(value: unknown): RankingDivision | null {
  return divisionAliases[normalizedKey(value)] ?? null;
}

function addEvidence(map: Map<RankingDivision, number>, division: RankingDivision | null, value: number) {
  if (!division || !value) return;
  map.set(division, numberValue(map.get(division)) + value);
}

function evidenceTotal(map: Map<RankingDivision, number>) {
  return Array.from(map.values()).reduce((sum, value) => sum + numberValue(value), 0);
}

function evidenceShare(
  map: Map<RankingDivision, number>,
  division: RankingDivision,
  fallback: RankingDivision | null,
) {
  const denominator = evidenceTotal(map);
  if (denominator > 0) return numberValue(map.get(division)) / denominator;
  return division === fallback ? 1 : 0;
}

function divisionForFight(input: RankingInputFighter, fight?: RankingInputFighter["facts"]["fights"][number]) {
  const direct = canonicalDivision(fight?.division);
  if (direct) return direct;
  return canonicalDivision(input.facts.identity.primaryDivision);
}

function fightForEvidence(input: RankingInputFighter, evidence: EvidenceRow) {
  if (evidence.fightId) {
    const direct = input.facts.fights.find((fight) => fight.id === evidence.fightId);
    if (direct) return direct;
  }
  const opponent = normalizedKey(evidence.opponent ?? evidence.label);
  const date = String(evidence.date ?? "");
  return input.facts.fights.find((fight) => {
    const candidate = normalizedKey(fight.opponent);
    const opponentMatches =
      !opponent || candidate === opponent || candidate.includes(opponent) || opponent.includes(candidate);
    return opponentMatches && (!date || fight.date === date);
  });
}

function weightedEvidence(
  input: RankingInputFighter,
  rows: readonly unknown[],
  valueFor: (row: EvidenceRow) => number,
) {
  const map = new Map<RankingDivision, number>();
  rows.forEach((value) => {
    const row = value as EvidenceRow;
    addEvidence(map, divisionForFight(input, fightForEvidence(input, row)), valueFor(row));
  });
  return map;
}

function primeBounds(input: RankingInputFighter) {
  const start = input.facts.fights.findIndex(
    (fight) => fight.id === input.facts.primeWindow.startFightId,
  );
  const end = input.facts.primeWindow.open
    ? input.facts.fights.length - 1
    : input.facts.fights.findIndex((fight) => fight.id === input.facts.primeWindow.endFightId);
  return { start, end };
}

function generalEvidence(input: RankingInputFighter) {
  const map = new Map<RankingDivision, number>();
  input.facts.fights
    .filter((fight) => SCORED_DISPOSITIONS.has(fight.scoringDisposition))
    .forEach((fight) => {
      const title = fight.championshipType !== "none" ? 1 : 0;
      const elite = ELITE_TIERS.has(fight.qualityTier) ? 0.65 : 0;
      addEvidence(map, divisionForFight(input, fight), 1 + title + elite);
    });
  return map;
}

function primeEvidence(input: RankingInputFighter) {
  const map = new Map<RankingDivision, number>();
  const { start, end } = primeBounds(input);
  if (start < 0 || end < start) return map;
  input.facts.fights
    .slice(start, end + 1)
    .filter((fight) => SCORED_DISPOSITIONS.has(fight.scoringDisposition))
    .forEach((fight) => {
      const rounds =
        fight.rounds.status === "audited"
          ? fight.rounds.won + fight.rounds.lost + fight.rounds.drawn
          : 0;
      const elite = ELITE_TIERS.has(fight.qualityTier) ? 0.5 : 0;
      const title = fight.championshipType !== "none" ? 0.5 : 0;
      addEvidence(
        map,
        divisionForFight(input, fight),
        1 + elite + title + Math.min(rounds, 5) * 0.05,
      );
    });
  return map;
}

function longevityEvidence(input: RankingInputFighter, fighter: RankingFighter) {
  const map = new Map<RankingDivision, number>();
  const fightsById = new Map(input.facts.fights.map((fight) => [fight.id, fight]));
  fighter.traces.longevity.stats.intervals.forEach((interval) => {
    const months = numberValue(interval.countedMonths);
    const from = divisionForFight(input, fightsById.get(interval.fromFightId));
    const to = interval.toFightId
      ? divisionForFight(input, fightsById.get(interval.toFightId))
      : from;
    if (from && to && from !== to) {
      addEvidence(map, from, months / 2);
      addEvidence(map, to, months / 2);
    } else {
      addEvidence(map, from ?? to, months);
    }
  });
  if (!evidenceTotal(map)) {
    primeEvidence(input).forEach((value, division) => addEvidence(map, division, value));
  }
  return map;
}

function lossEvidence(input: RankingInputFighter, fighter: RankingFighter) {
  const map = new Map<RankingDivision, number>();
  fighter.traces.penalty.events.forEach((value) => {
    const event = value as EvidenceRow;
    const fight = fightForEvidence(input, event);
    const weight = Math.abs(
      numberValue(event.rawPenalty ?? event.total ?? event.base) + numberValue(event.finishExtra),
    );
    addEvidence(map, divisionForFight(input, fight), weight || 1);
  });
  return map;
}

function formatRecord(counts: {
  wins: number;
  losses: number;
  draws: number;
  noContests: number;
}) {
  return `${counts.wins}-${counts.losses}${counts.draws ? `-${counts.draws}` : ""}${
    counts.noContests ? `, ${counts.noContests} NC` : ""
  }`;
}

function divisionStats(
  input: RankingInputFighter,
  fighter: RankingFighter,
  division: RankingDivision,
  longevityMonths: number,
): DivisionVisibleStats {
  const fights = input.facts.fights.filter(
    (fight) => divisionForFight(input, fight) === division,
  );
  const counts = { wins: 0, losses: 0, draws: 0, noContests: 0 };
  fights.forEach((fight) => {
    if (fight.officialResult === "win") counts.wins += 1;
    else if (fight.officialResult === "loss") counts.losses += 1;
    else if (fight.officialResult === "draw") counts.draws += 1;
    else if (fight.officialResult === "no-contest") counts.noContests += 1;
  });

  const wins = fights.filter((fight) => fight.scoringDisposition === "count-win");
  const finishWins = wins.filter((fight) => FINISH_METHODS.has(fight.methodCategory)).length;
  const { start, end } = primeBounds(input);
  const primeFights =
    start >= 0 && end >= start
      ? input.facts.fights
          .slice(start, end + 1)
          .filter(
            (fight) =>
              divisionForFight(input, fight) === division &&
              SCORED_DISPOSITIONS.has(fight.scoringDisposition),
          )
      : [];
  const primeCounts = {
    wins: primeFights.filter((fight) => fight.scoringDisposition === "count-win").length,
    losses: primeFights.filter((fight) => fight.scoringDisposition === "count-loss").length,
    draws: primeFights.filter((fight) => fight.scoringDisposition === "count-draw").length,
    noContests: 0,
  };
  const rounds = primeFights.reduce(
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

  const adjustedTitleWins = fighter.traces.championship.inputs.reduce((sum, value) => {
    const row = value as EvidenceRow;
    const fight = fightForEvidence(input, row);
    return divisionForFight(input, fight) === division
      ? sum + numberValue(row.finalAdjustedCredit ?? row.adjustedCredit ?? row.credit)
      : sum;
  }, 0);

  return {
    ufcRecord: formatRecord(counts),
    ufcFightCount: fights.length,
    ufcWins: counts.wins,
    ufcLosses: counts.losses,
    ufcDraws: counts.draws,
    ufcNoContests: counts.noContests,
    titleFightWins: fights.filter(
      (fight) =>
        OFFICIAL_TITLE_TYPES.has(fight.championshipType) &&
        fight.championshipEligible !== false &&
        fight.scoringDisposition === "count-win",
    ).length,
    adjustedTitleWins: round2(adjustedTitleWins),
    topFiveWins: wins.filter((fight) => ELITE_TIERS.has(fight.qualityTier)).length,
    rankedWins: wins.filter((fight) => RANKED_TIERS.has(fight.qualityTier)).length,
    finishRatePct: wins.length ? round2((finishWins / wins.length) * 100) : 0,
    primeRecord: formatRecord(primeCounts),
    roundsWonPct: roundTotal
      ? round2(((rounds.won + rounds.drawn * 0.5) / roundTotal) * 100)
      : 0,
    activeEliteYears: round2(longevityMonths / 12),
  };
}

function fighterDivisionRows(fighter: RankingFighter): Omit<DivisionRankingRow, "rank">[] {
  const input = inputByFighter.get(fighter.fighter);
  const projection = projectionByFighter.get(fighter.fighter);
  if (!input || !projection) return [];

  const primary = canonicalDivision(input.facts.identity.primaryDivision);
  const secondary = new Set(
    input.facts.identity.secondaryDivisions
      .map(canonicalDivision)
      .filter((division): division is RankingDivision => Boolean(division)),
  );
  const maps = {
    championship: weightedEvidence(input, fighter.traces.championship.inputs, (row) =>
      numberValue(row.finalAdjustedCredit ?? row.adjustedCredit ?? row.credit),
    ),
    opponentQuality: weightedEvidence(input, fighter.traces.opponentQuality.inputs, (row) =>
      numberValue(row.countedCredit ?? row.finalCredit ?? row.credit),
    ),
    primeDominance: primeEvidence(input),
    longevity: longevityEvidence(input, fighter),
    apex: weightedEvidence(input, fighter.traces.apex.performances, (row) =>
      numberValue(row.rating) || 1,
    ),
    penalty: lossEvidence(input, fighter),
    general: generalEvidence(input),
  };
  const divisions = new Set(
    input.facts.fights
      .map((fight) => divisionForFight(input, fight))
      .filter((division): division is RankingDivision => Boolean(division)),
  );
  const weighted = {
    championship: projection.weighted.championship,
    opponentQuality: projection.weighted.opponentQuality,
    primeDominance: projection.weighted.primeDominance,
    longevity: projection.weighted.longevity,
    apex: projection.modifiers.apex,
    penalty: projection.modifiers.penalty,
    eraDepth: projection.modifiers.eraDepth,
  };

  return Array.from(divisions).map((division) => {
    const shares = {
      championship: evidenceShare(maps.championship, division, primary),
      opponentQuality: evidenceShare(maps.opponentQuality, division, primary),
      primeDominance: evidenceShare(maps.primeDominance, division, primary),
      longevity: evidenceShare(maps.longevity, division, primary),
      apex: evidenceShare(maps.apex, division, primary),
      penalty: evidenceShare(maps.penalty, division, primary),
      eraDepth: evidenceShare(maps.general, division, primary),
    };
    const components = {
      championship: round2(weighted.championship * shares.championship),
      opponentQuality: round2(weighted.opponentQuality * shares.opponentQuality),
      primeDominance: round2(weighted.primeDominance * shares.primeDominance),
      longevity: round2(weighted.longevity * shares.longevity),
      apex: round2(weighted.apex * shares.apex),
      penalty: round2(weighted.penalty * shares.penalty),
      eraDepth: round2(weighted.eraDepth * shares.eraDepth),
    };
    const divisionScore = round2(
      Object.values(components).reduce((sum, value) => sum + numberValue(value), 0),
    );
    const positiveOverall =
      weighted.championship +
      weighted.opponentQuality +
      weighted.primeDominance +
      weighted.longevity +
      weighted.apex;
    const positiveDivision =
      components.championship +
      components.opponentQuality +
      components.primeDominance +
      components.longevity +
      components.apex;
    const resumeShare =
      positiveOverall > 0
        ? positiveDivision / positiveOverall
        : evidenceShare(maps.general, division, primary);
    const longevityMonths = evidenceTotal(maps.longevity) * shares.longevity;
    const stats = divisionStats(input, fighter, division, longevityMonths);

    return {
      fighter,
      division,
      divisionLabel: divisionLabel(division),
      role: division === primary ? "primary" : secondary.has(division) ? "secondary" : "crossover",
      rankEligible: stats.ufcWins > 0,
      divisionScore,
      resumeSharePct: round2(resumeShare * 100),
      components,
      stats,
    };
  });
}

function buildDivisionRankingReport(): DivisionRankingReport {
  const allocationRows = menAllTime.flatMap(fighterDivisionRows);
  const boards: Partial<Record<RankingDivision, DivisionRankingRow[]>> = {};

  divisionOrder.forEach((division) => {
    const ranked = allocationRows
      .filter((row) => row.division === division && row.rankEligible)
      .slice()
      .sort(
        (left, right) =>
          right.divisionScore - left.divisionScore ||
          right.fighter.rawScore - left.fighter.rawScore ||
          left.fighter.name.localeCompare(right.fighter.name),
      )
      .map((row, index) => ({ ...row, rank: index + 1 }));
    if (ranked.length) boards[division] = ranked;
  });

  const conservation = menAllTime.flatMap((fighter) => {
    const allocated = round2(
      allocationRows
        .filter((row) => row.fighter.fighter === fighter.fighter)
        .reduce((sum, row) => sum + row.divisionScore, 0),
    );
    const expected = round2(fighter.rawScore);
    const difference = round2(allocated - expected);
    return Math.abs(difference) > 0.08
      ? [{ fighter: fighter.fighter, allocated, expected, difference }]
      : [];
  });

  const rows = divisionOrder.flatMap((division) => boards[division] ?? []);
  return {
    passed: conservation.length === 0 && rows.every((row) => Number.isFinite(row.divisionScore)),
    allocationOwner: "canonical fight-level division evidence",
    eligibilityRule: "at least one UFC win in the division",
    minimumResumeSharePct: DIVISION_RESUME_SHARE_MIN,
    rows,
    boards,
    conservation,
  };
}

export const divisionRankingReport = buildDivisionRankingReport();

export function qualifiedDivisionBoard(division: RankingDivision) {
  return (divisionRankingReport.boards[division] ?? []).filter(
    (row) => row.resumeSharePct >= DIVISION_RESUME_SHARE_MIN,
  );
}

export const rankingEras: readonly RankingEra[] = canonicalRankingInputs.filters.eras;

export function erasForBoard(board: CategoryGender) {
  return board === "women"
    ? rankingEras.filter((era) => era.startYear >= 2011)
    : rankingEras;
}

export function fighterBelongsToEra(fighter: RankingFighter, eraId: string) {
  const membership = canonicalRankingInputs.filters.eraMembership[fighter.fighter];
  return Boolean(
    membership && (membership.primary === eraId || membership.secondary === eraId),
  );
}

export function rankingCategoryValue(fighter: RankingFighter, category: RankingCategory) {
  return fighter[category];
}

export function categoryBoard(gender: CategoryGender, category: RankingCategory) {
  const rows = gender === "women" ? womenAllTime : menAllTime;
  return rows
    .slice()
    .sort(
      (left, right) =>
        rankingCategoryValue(right, category) - rankingCategoryValue(left, category) ||
        right.rawScore - left.rawScore ||
        left.name.localeCompare(right.name),
    );
}
