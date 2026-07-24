import { canonicalRankingInputs, type RankingInputFighter } from "../rankings/data/rankingInputs";
import { allTime } from "../rankings/rankingModel";
import type { CanonicalFight } from "../rankings/engine/schemas";

const VERSION = "find-leader-v2-20260724";
const DAILY_ANCHOR = "2026-07-16";
const NO_REPEAT_SELECTIONS = 14;
const FINISH_METHODS = new Set(["ko-tko", "submission", "doctor-stoppage"]);
const TITLE_TYPES = new Set([
  "normal",
  "interim",
  "vacant-undisputed",
  "second-division-undisputed",
  "vacant-second-division",
]);
const RANKED_TIERS = new Set(["champion-level", "top-five", "top-ten", "ranked"]);
const TOP_FIVE_TIERS = new Set(["champion-level", "top-five"]);

export type FindLeaderMetric =
  | "wins"
  | "finishes"
  | "submissions"
  | "knockouts"
  | "decision-wins"
  | "title-fight-wins"
  | "top-five-wins"
  | "ranked-wins"
  | "longest-win-streak"
  | "wins-before-first-loss"
  | "win-span-months"
  | "finish-rate-pct"
  | "prime-wins"
  | "prime-finishes"
  | "wins-unfinished";

export type FindLeaderFamily =
  | "wins"
  | "finishes"
  | "championship"
  | "quality"
  | "streaks"
  | "rates"
  | "longevity"
  | "durability"
  | "era"
  | "filtered";

export interface FindLeaderScope {
  board?: "men" | "women";
  championsOnly?: boolean;
  division?: string;
}

export interface FindLeaderQuestionDefinition {
  id: string;
  question: string;
  statLabel: string;
  shortLabel: string;
  metric: FindLeaderMetric;
  family: FindLeaderFamily;
  since?: string;
  through?: string;
  minimumWins?: number;
  scope?: FindLeaderScope;
}

export interface FindLeaderCandidate {
  id: string;
  name: string;
  value: number;
  division: string;
  thumbUrl: string;
}

export interface FindLeaderBoard {
  version: string;
  day: string;
  definitionId: string;
  question: string;
  context: string;
  statLabel: string;
  shortLabel: string;
  family: FindLeaderFamily;
  leaderId: string;
  leaderValue: number;
  candidates: FindLeaderCandidate[];
}

const q = (
  id: string,
  question: string,
  statLabel: string,
  shortLabel: string,
  metric: FindLeaderMetric,
  family: FindLeaderFamily,
  extra: Partial<FindLeaderQuestionDefinition> = {},
): FindLeaderQuestionDefinition => ({ id, question, statLabel, shortLabel, metric, family, ...extra });

export const findLeaderQuestions: readonly FindLeaderQuestionDefinition[] = [
  q("ufc-wins-all-time", "Who has the most UFC wins of all time?", "all-time UFC wins", "UFC WINS", "wins", "wins"),
  q("ufc-finishes-all-time", "Who has the most UFC finishes of all time?", "all-time UFC finishes", "FINISHES", "finishes", "finishes"),
  q("submission-wins-all-time", "Who has the most UFC submission wins of all time?", "all-time UFC submission wins", "SUBMISSIONS", "submissions", "finishes"),
  q("ko-wins-all-time", "Who has the most UFC knockout wins of all time?", "all-time UFC KO/TKO wins", "KNOCKOUTS", "knockouts", "finishes"),
  q("decision-wins-all-time", "Who has the most UFC decision wins of all time?", "all-time UFC decision wins", "DECISION WINS", "decision-wins", "wins"),
  q("title-fight-wins-all-time", "Who has the most UFC title-fight wins of all time?", "all-time UFC title-fight wins", "TITLE WINS", "title-fight-wins", "championship"),
  q("longest-ufc-winning-streak", "Who has the longest UFC winning streak?", "consecutive UFC wins", "WIN STREAK", "longest-win-streak", "streaks"),
  q("top-five-wins-all-time", "Who has the most wins over UFC top-five opposition?", "UFC top-five wins", "TOP-5 WINS", "top-five-wins", "quality"),
  q("ranked-wins-all-time", "Who has the most wins over ranked UFC opposition?", "UFC ranked wins", "RANKED WINS", "ranked-wins", "quality"),
  q("ufc-wins-before-first-loss", "Who earned the most UFC wins before their first UFC loss?", "UFC wins before first loss", "PRE-LOSS WINS", "wins-before-first-loss", "streaks"),
  q("longest-ufc-win-span", "Who has the longest span between their first and latest UFC win?", "months between first and latest UFC win", "WIN SPAN", "win-span-months", "longevity"),
  q("highest-ufc-finish-rate-10-wins", "Who has the highest UFC finish percentage with at least 10 wins?", "UFC finish percentage", "FINISH RATE", "finish-rate-pct", "rates", { minimumWins: 10 }),
  q("prime-ufc-wins", "Who earned the most UFC wins during their model prime?", "UFC wins during the model prime", "PRIME WINS", "prime-wins", "quality"),
  q("prime-ufc-finishes", "Who earned the most UFC finishes during their model prime?", "UFC finishes during the model prime", "PRIME FINISHES", "prime-finishes", "finishes"),
  q("ufc-wins-unfinished", "Who has the most UFC wins without ever being finished?", "UFC wins without a finish loss", "UNFINISHED WINS", "wins-unfinished", "durability"),
  q("ufc-wins-since-2022", "Who has the most UFC wins since 2022?", "UFC wins since 2022", "UFC WINS", "wins", "wins", { since: "2022-01-01" }),
  q("ufc-finishes-since-2022", "Who has the most UFC finishes since 2022?", "UFC finishes since 2022", "FINISHES", "finishes", "finishes", { since: "2022-01-01" }),
  q("ufc-wins-since-2020", "Who has the most UFC wins since 2020?", "UFC wins since 2020", "UFC WINS", "wins", "wins", { since: "2020-01-01" }),
  q("ufc-finishes-since-2020", "Who has the most UFC finishes since 2020?", "UFC finishes since 2020", "FINISHES", "finishes", "finishes", { since: "2020-01-01" }),
  q("submission-wins-since-2020", "Who has the most UFC submission wins since 2020?", "UFC submission wins since 2020", "SUBMISSIONS", "submissions", "finishes", { since: "2020-01-01" }),
  q("ko-wins-since-2020", "Who has the most UFC knockout wins since 2020?", "UFC KO/TKO wins since 2020", "KNOCKOUTS", "knockouts", "finishes", { since: "2020-01-01" }),
  q("ufc-wins-since-2018", "Who has the most UFC wins since 2018?", "UFC wins since 2018", "UFC WINS", "wins", "wins", { since: "2018-01-01" }),
  q("title-fight-wins-since-2018", "Who has the most UFC title-fight wins since 2018?", "UFC title-fight wins since 2018", "TITLE WINS", "title-fight-wins", "championship", { since: "2018-01-01" }),
  q("ufc-finishes-since-2018", "Who has the most UFC finishes since 2018?", "UFC finishes since 2018", "FINISHES", "finishes", "finishes", { since: "2018-01-01" }),
  q("ufc-wins-since-2015", "Who has the most UFC wins since 2015?", "UFC wins since 2015", "UFC WINS", "wins", "wins", { since: "2015-01-01" }),
  q("ufc-finishes-since-2015", "Who has the most UFC finishes since 2015?", "UFC finishes since 2015", "FINISHES", "finishes", "finishes", { since: "2015-01-01" }),
  q("submission-wins-since-2015", "Who has the most UFC submission wins since 2015?", "UFC submission wins since 2015", "SUBMISSIONS", "submissions", "finishes", { since: "2015-01-01" }),
  q("ko-wins-since-2015", "Who has the most UFC knockout wins since 2015?", "UFC KO/TKO wins since 2015", "KNOCKOUTS", "knockouts", "finishes", { since: "2015-01-01" }),
  q("decision-wins-since-2015", "Who has the most UFC decision wins since 2015?", "UFC decision wins since 2015", "DECISION WINS", "decision-wins", "wins", { since: "2015-01-01" }),
  q("ufc-wins-2013-2019", "Who had the most UFC wins from 2013 through 2019?", "UFC wins from 2013 through 2019", "ERA WINS", "wins", "era", { since: "2013-01-01", through: "2019-12-31" }),
  q("ufc-finishes-2013-2019", "Who had the most UFC finishes from 2013 through 2019?", "UFC finishes from 2013 through 2019", "ERA FINISHES", "finishes", "era", { since: "2013-01-01", through: "2019-12-31" }),
  q("submission-wins-2013-2019", "Who had the most UFC submission wins from 2013 through 2019?", "UFC submission wins from 2013 through 2019", "SUBMISSIONS", "submissions", "era", { since: "2013-01-01", through: "2019-12-31" }),
  q("ko-wins-2013-2019", "Who had the most UFC knockout wins from 2013 through 2019?", "UFC KO/TKO wins from 2013 through 2019", "KNOCKOUTS", "knockouts", "era", { since: "2013-01-01", through: "2019-12-31" }),
  q("ufc-wins-2005-2012", "Who had the most UFC wins from 2005 through 2012?", "UFC wins from 2005 through 2012", "ERA WINS", "wins", "era", { since: "2005-01-01", through: "2012-12-31" }),
  q("ufc-finishes-2005-2012", "Who had the most UFC finishes from 2005 through 2012?", "UFC finishes from 2005 through 2012", "ERA FINISHES", "finishes", "era", { since: "2005-01-01", through: "2012-12-31" }),
  q("ufc-wins-1993-2004", "Who had the most UFC wins from 1993 through 2004?", "UFC wins from 1993 through 2004", "ERA WINS", "wins", "era", { since: "1993-11-12", through: "2004-12-31" }),
  q("ufc-finishes-1993-2004", "Who had the most UFC finishes from 1993 through 2004?", "UFC finishes from 1993 through 2004", "ERA FINISHES", "finishes", "era", { since: "1993-11-12", through: "2004-12-31" }),
  q("women-ufc-wins-all-time", "Which woman has the most UFC wins of all time?", "women’s all-time UFC wins", "WOMEN’S WINS", "wins", "filtered", { scope: { board: "women" } }),
  q("women-ufc-finishes-all-time", "Which woman has the most UFC finishes of all time?", "women’s all-time UFC finishes", "WOMEN’S FINISHES", "finishes", "filtered", { scope: { board: "women" } }),
  q("women-title-fight-wins-all-time", "Which woman has the most UFC title-fight wins?", "women’s UFC title-fight wins", "TITLE WINS", "title-fight-wins", "filtered", { scope: { board: "women" } }),
  q("champions-ufc-wins-all-time", "Which UFC champion has the most UFC wins?", "UFC wins by a UFC champion", "CHAMPION WINS", "wins", "filtered", { scope: { championsOnly: true } }),
  q("champions-ufc-finishes-all-time", "Which UFC champion has the most UFC finishes?", "UFC finishes by a UFC champion", "CHAMPION FINISHES", "finishes", "filtered", { scope: { championsOnly: true } }),
  q("lightweight-ufc-wins-all-time", "Who has the most UFC wins among lightweights?", "UFC wins by a lightweight", "LIGHTWEIGHT WINS", "wins", "filtered", { scope: { division: "Lightweight" } }),
  q("lightweight-ufc-finishes-all-time", "Who has the most UFC finishes among lightweights?", "UFC finishes by a lightweight", "LIGHTWEIGHT FINISHES", "finishes", "filtered", { scope: { division: "Lightweight" } }),
  q("welterweight-ufc-wins-all-time", "Who has the most UFC wins among welterweights?", "UFC wins by a welterweight", "WELTERWEIGHT WINS", "wins", "filtered", { scope: { division: "Welterweight" } }),
  q("welterweight-ufc-finishes-all-time", "Who has the most UFC finishes among welterweights?", "UFC finishes by a welterweight", "WELTERWEIGHT FINISHES", "finishes", "filtered", { scope: { division: "Welterweight" } }),
  q("middleweight-ufc-wins-all-time", "Who has the most UFC wins among middleweights?", "UFC wins by a middleweight", "MIDDLEWEIGHT WINS", "wins", "filtered", { scope: { division: "Middleweight" } }),
  q("heavyweight-ufc-finishes-all-time", "Who has the most UFC finishes among heavyweights?", "UFC finishes by a heavyweight", "HEAVYWEIGHT FINISHES", "finishes", "filtered", { scope: { division: "Heavyweight" } }),
  q("bantamweight-ufc-wins-all-time", "Who has the most UFC wins among bantamweights?", "UFC wins by a bantamweight", "BANTAMWEIGHT WINS", "wins", "filtered", { scope: { division: "Bantamweight" } }),
  q("featherweight-ufc-finishes-all-time", "Who has the most UFC finishes among featherweights?", "UFC finishes by a featherweight", "FEATHERWEIGHT FINISHES", "finishes", "filtered", { scope: { division: "Featherweight" } }),
] as const;

const fighterPresentation = new Map(allTime.map((fighter) => [fighter.name, fighter]));

function normalized(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function inWindow(fight: CanonicalFight, definition: FindLeaderQuestionDefinition) {
  if (definition.since && fight.date < definition.since) return false;
  if (definition.through && fight.date > definition.through) return false;
  return true;
}

function isCountedWin(fight: CanonicalFight) {
  return fight.scoringDisposition === "count-win";
}

function isFinish(fight: CanonicalFight) {
  return FINISH_METHODS.has(fight.methodCategory);
}

function isTitleFight(fight: CanonicalFight) {
  return TITLE_TYPES.has(fight.championshipType) && fight.championshipEligible !== false;
}

function hasTitleWin(input: RankingInputFighter) {
  return input.facts.fights.some((fight) => isCountedWin(fight) && isTitleFight(fight));
}

function matchesScope(input: RankingInputFighter, definition: FindLeaderQuestionDefinition) {
  const scope = definition.scope;
  if (!scope) return true;
  if (scope.board && input.board !== scope.board) return false;
  if (scope.championsOnly && !hasTitleWin(input)) return false;
  if (scope.division) {
    const wanted = normalized(scope.division);
    const divisions = [input.facts.identity.primaryDivision, ...input.facts.identity.secondaryDivisions].map(normalized);
    if (!divisions.includes(wanted)) return false;
  }
  return true;
}

function primeFights(input: RankingInputFighter) {
  const start = input.facts.fights.findIndex((fight) => fight.id === input.facts.primeWindow.startFightId);
  const end = input.facts.primeWindow.open
    ? input.facts.fights.length - 1
    : input.facts.fights.findIndex((fight) => fight.id === input.facts.primeWindow.endFightId);
  return start >= 0 && end >= start ? input.facts.fights.slice(start, end + 1) : [];
}

function longestWinningStreak(fights: readonly CanonicalFight[]) {
  let current = 0;
  let longest = 0;
  fights.forEach((fight) => {
    if (isCountedWin(fight)) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });
  return longest;
}

function winsBeforeFirstLoss(fights: readonly CanonicalFight[]) {
  let wins = 0;
  for (const fight of fights) {
    if (fight.scoringDisposition === "count-loss") break;
    if (isCountedWin(fight)) wins += 1;
  }
  return wins;
}

function winSpanMonths(fights: readonly CanonicalFight[]) {
  const dates = fights.filter(isCountedWin).map((fight) => fight.date).sort();
  if (dates.length < 2) return 0;
  const first = Date.parse(`${dates[0]}T00:00:00Z`);
  const last = Date.parse(`${dates.at(-1)}T00:00:00Z`);
  return Math.round((last - first) / (1000 * 60 * 60 * 24 * 30.4375));
}

function scoreFighter(input: RankingInputFighter, definition: FindLeaderQuestionDefinition) {
  if (!matchesScope(input, definition)) return null;
  const fights = input.facts.fights.filter((fight) => inWindow(fight, definition));
  const wins = fights.filter(isCountedWin);
  const finishWins = wins.filter(isFinish);
  if (definition.minimumWins && wins.length < definition.minimumWins) return null;

  switch (definition.metric) {
    case "wins": return wins.length;
    case "finishes": return finishWins.length;
    case "submissions": return wins.filter((fight) => fight.methodCategory === "submission").length;
    case "knockouts": return wins.filter((fight) => fight.methodCategory === "ko-tko").length;
    case "decision-wins": return wins.filter((fight) => fight.methodCategory === "decision").length;
    case "title-fight-wins": return wins.filter(isTitleFight).length;
    case "top-five-wins": return wins.filter((fight) => TOP_FIVE_TIERS.has(fight.qualityTier)).length;
    case "ranked-wins": return wins.filter((fight) => RANKED_TIERS.has(fight.qualityTier)).length;
    case "longest-win-streak": return longestWinningStreak(fights);
    case "wins-before-first-loss": return winsBeforeFirstLoss(fights);
    case "win-span-months": return winSpanMonths(fights);
    case "finish-rate-pct": return wins.length ? Math.round((finishWins.length / wins.length) * 100) : 0;
    case "prime-wins": return primeFights(input).filter(isCountedWin).length;
    case "prime-finishes": return primeFights(input).filter((fight) => isCountedWin(fight) && isFinish(fight)).length;
    case "wins-unfinished": {
      const finishedLoss = fights.some((fight) => fight.scoringDisposition === "count-loss" && isFinish(fight));
      return finishedLoss ? 0 : wins.length;
    }
  }
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: readonly T[], random: () => number) {
  const rows = [...values];
  for (let index = rows.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [rows[index], rows[swap]] = [rows[swap], rows[index]];
  }
  return rows;
}

function scoredPool(definition: FindLeaderQuestionDefinition) {
  return canonicalRankingInputs.fighters
    .map((input) => ({ input, value: scoreFighter(input, definition) }))
    .filter((row): row is { input: RankingInputFighter; value: number } => Number.isFinite(row.value))
    .sort((left, right) => right.value - left.value || left.input.fighter.localeCompare(right.input.fighter));
}

function candidateFor(input: RankingInputFighter, value: number): FindLeaderCandidate {
  const presentation = fighterPresentation.get(input.fighter);
  return {
    id: input.presentation.slug,
    name: input.fighter,
    value,
    division: presentation?.division ?? input.facts.identity.primaryDivision,
    thumbUrl: presentation?.thumbUrl ?? `/assets/fighters/${input.presentation.slug}-thumb.webp`,
  };
}

export function buildFindLeaderBoard(
  definition: FindLeaderQuestionDefinition,
  seed: string,
  day = centralDay(),
): FindLeaderBoard | null {
  const random = mulberry32(hashSeed(`${VERSION}|${seed}|${definition.id}`));
  const pool = scoredPool(definition);
  if (pool.length < 10) return null;
  const possibleLeaders = pool.filter((row) => row.value > 0 && pool.filter((other) => other.value < row.value).length >= 9).slice(0, 10);
  if (!possibleLeaders.length) return null;
  const leader = possibleLeaders[Math.floor(random() * possibleLeaders.length)];
  const lower = pool.filter((row) => row.value < leader.value);
  if (lower.length < 9) return null;
  const near = lower.slice(0, Math.min(14, lower.length));
  const selected = [leader, ...shuffle(near, random).slice(0, Math.min(6, near.length))];
  const used = new Set(selected.map((row) => row.input.fighter));
  selected.push(...shuffle(lower.filter((row) => !used.has(row.input.fighter)), random).slice(0, 10 - selected.length));
  if (selected.length !== 10) return null;
  const candidates = shuffle(selected.map((row) => candidateFor(row.input, row.value)), random);
  return {
    version: VERSION,
    day,
    definitionId: definition.id,
    question: `Who leads this group in ${definition.statLabel.replace(/^all-time\s+/i, "")}?`,
    context: `Highest ${definition.statLabel} among the ten fighters shown. The overall UFC record holder does not have to appear.`,
    statLabel: definition.statLabel,
    shortLabel: definition.shortLabel,
    family: definition.family,
    leaderId: leader.input.presentation.slug,
    leaderValue: leader.value,
    candidates,
  };
}

function dayNumber(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, date) / 86_400_000);
}

const FAMILY_CYCLE: readonly FindLeaderFamily[] = [
  "wins", "finishes", "championship", "filtered", "quality", "streaks", "era", "wins",
  "finishes", "durability", "rates", "longevity", "filtered", "quality", "wins", "finishes",
];

export function centralDay(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function scheduledFindLeaderDefinition(day = centralDay()) {
  const target = Math.max(0, dayNumber(day) - dayNumber(DAILY_ANCHOR));
  const history: string[] = [];
  let selected: FindLeaderQuestionDefinition | null = null;
  for (let slot = 0; slot <= target; slot += 1) {
    const recent = new Set(history.slice(-NO_REPEAT_SELECTIONS));
    const family = FAMILY_CYCLE[slot % FAMILY_CYCLE.length];
    const available = findLeaderQuestions.filter((definition) => buildFindLeaderBoard(definition, `audit-${slot}`, day));
    const preferred = available.filter((definition) => definition.family === family && !recent.has(definition.id));
    const fresh = available.filter((definition) => !recent.has(definition.id));
    const candidates = preferred.length ? preferred : fresh.length ? fresh : available;
    selected = [...candidates].sort((left, right) => hashSeed(`${VERSION}|${slot}|${left.id}`) - hashSeed(`${VERSION}|${slot}|${right.id}`))[0] ?? null;
    if (selected) history.push(selected.id);
  }
  return selected;
}

export function dailyFindLeaderBoard(day = centralDay()) {
  const definition = scheduledFindLeaderDefinition(day);
  return definition ? buildFindLeaderBoard(definition, `daily|${day}`, day) : null;
}

export function findLeaderAudit() {
  const rows = findLeaderQuestions.map((definition) => ({
    definition,
    board: buildFindLeaderBoard(definition, `audit|${definition.id}`, DAILY_ANCHOR),
  }));
  return {
    version: VERSION,
    definitionCount: findLeaderQuestions.length,
    validCount: rows.filter((row) => row.board).length,
    invalid: rows.filter((row) => !row.board).map((row) => row.definition.id),
  };
}
