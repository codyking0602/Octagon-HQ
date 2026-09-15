import { canonicalRankingInputs, type RankingInputFighter } from "../rankings/data/rankingInputs";
import { allTime } from "../rankings/rankingModel";
import type { CanonicalFight } from "../rankings/engine/schemas";
import {
  dailyLineupSeed,
  seededLineupRandom,
  shuffleLineup,
  stableLineupHash,
} from "./lineupModel";
import {
  selectFindLeaderCompetition,
  viableCompetitiveLeaders,
} from "./findLeaderCompetition";
import {
  deriveUfcCareerStats,
  isUfcCareerFinish,
  isUfcCareerTitleFight,
  isUfcCareerWin,
} from "./ufcCareerStats";

const VERSION = "find-leader-v5-20260819-plausible-decoys";
export const FIND_LEADER_DAILY_CONTENT_VERSION = "find-leader-daily-v2" as const;
const DAILY_ANCHOR = "2026-07-16";
const NO_REPEAT_SELECTIONS = 14;
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
  | "wins-unfinished"
  | "main-events"
  | "bonus-awards"
  | "first-round-finishes"
  | "knockdowns-landed"
  | "fights"
  | "title-fights"
  | "title-fight-finishes"
  | "title-fight-knockouts"
  | "title-fight-submissions"
  | "unique-title-opponents-faced"
  | "unique-title-opponents-beaten"
  | "unique-opponents-beaten"
  | "unique-opponents-finished"
  | "unique-ranked-opponents-beaten"
  | "unique-top-five-opponents-beaten"
  | "ranked-finishes"
  | "top-five-finishes"
  | "longest-finish-streak"
  | "longest-ko-streak"
  | "longest-submission-streak"
  | "win-years"
  | "finish-years"
  | "active-years"
  | "fight-span-months"
  | "rematch-wins"
  | "avenged-loss-wins"
  | "repeat-opponent-wins"
  | "wins-after-first-loss"
  | "bounce-back-wins"
  | "divisions-with-win"
  | "divisions-with-finish"
  | "best-year-wins"
  | "best-year-finishes"
  | "max-wins-vs-one-opponent";

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
  | "filtered"
  | "volume"
  | "rivalry"
  | "versatility"
  | "supplemental";

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
  q("ufc-main-events-all-time", "Who has made the most UFC main-event appearances?", "all-time UFC main-event appearances", "UFC MAIN EVENTS", "main-events", "supplemental"),
  q("ufc-bonus-awards-all-time", "Who has earned the most UFC bonus awards?", "all-time UFC bonus awards", "UFC BONUS AWARDS", "bonus-awards", "supplemental"),
  q("first-round-ufc-finishes-all-time", "Who has the most first-round UFC finishes?", "all-time first-round UFC finishes", "FIRST-ROUND FINISHES", "first-round-finishes", "supplemental"),
  q("ufc-knockdowns-landed-all-time", "Who has landed the most UFC knockdowns?", "all-time UFC knockdowns landed", "UFC KNOCKDOWNS", "knockdowns-landed", "supplemental"),

  q("ufc-fights-all-time", "Who has made the most UFC appearances?", "all-time UFC appearances", "UFC FIGHTS", "fights", "volume"),
  q("title-fights-all-time", "Who has fought in the most UFC title fights?", "all-time UFC title fights", "TITLE FIGHTS", "title-fights", "championship"),
  q("title-fight-finishes-all-time", "Who has the most UFC title-fight finishes?", "all-time UFC title-fight finishes", "TITLE FINISHES", "title-fight-finishes", "championship"),
  q("title-fight-kos-all-time", "Which UFC champion has the most title-fight KO/TKO wins?", "UFC title-fight KO/TKO wins", "TITLE KOS", "title-fight-knockouts", "championship", { scope: { championsOnly: true } }),
  q("title-fight-submissions-all-time", "Which UFC champion has the most title-fight submission wins?", "UFC title-fight submission wins", "TITLE SUBS", "title-fight-submissions", "championship", { scope: { championsOnly: true } }),
  q("unique-title-opponents-faced", "Which UFC champion has faced the most different title-fight opponents?", "different UFC title-fight opponents faced", "TITLE OPPONENTS", "unique-title-opponents-faced", "championship", { scope: { championsOnly: true } }),
  q("unique-title-opponents-beaten", "Which UFC champion has beaten the most different title-fight opponents?", "different UFC title-fight opponents beaten", "TITLE WINS", "unique-title-opponents-beaten", "championship", { scope: { championsOnly: true } }),
  q("unique-opponents-beaten", "Who has beaten the most different UFC opponents?", "different UFC opponents beaten", "UNIQUE WINS", "unique-opponents-beaten", "volume"),
  q("unique-opponents-finished", "Who has finished the most different UFC opponents?", "different UFC opponents finished", "UNIQUE FINISHES", "unique-opponents-finished", "finishes"),
  q("unique-ranked-opponents-beaten", "Who has beaten the most different ranked UFC opponents?", "different ranked UFC opponents beaten", "RANKED OPPONENTS", "unique-ranked-opponents-beaten", "quality"),
  q("unique-top-five-opponents-beaten", "Who has beaten the most different UFC top-five opponents?", "different UFC top-five opponents beaten", "TOP-5 OPPONENTS", "unique-top-five-opponents-beaten", "quality"),
  q("ranked-finishes-all-time", "Who has the most finishes over ranked UFC opposition?", "UFC finishes over ranked opposition", "RANKED FINISHES", "ranked-finishes", "quality"),
  q("top-five-finishes-all-time", "Who has the most finishes over UFC top-five opposition?", "UFC finishes over top-five opposition", "TOP-5 FINISHES", "top-five-finishes", "quality"),
  q("longest-ufc-finish-streak", "Who has the longest streak of consecutive UFC finishes?", "consecutive UFC finishes", "FINISH STREAK", "longest-finish-streak", "streaks"),
  q("longest-ufc-ko-streak", "Who has the longest streak of consecutive UFC KO/TKO wins?", "consecutive UFC KO/TKO wins", "KO STREAK", "longest-ko-streak", "streaks"),
  q("longest-ufc-submission-streak", "Who has the longest streak of consecutive UFC submission wins?", "consecutive UFC submission wins", "SUB STREAK", "longest-submission-streak", "streaks"),
  q("ufc-winning-years", "Who has recorded a UFC win in the most different calendar years?", "calendar years with a UFC win", "WINNING YEARS", "win-years", "longevity"),
  q("ufc-finishing-years", "Who has recorded a UFC finish in the most different calendar years?", "calendar years with a UFC finish", "FINISH YEARS", "finish-years", "longevity"),
  q("ufc-active-years", "Who has competed in the UFC in the most different calendar years?", "calendar years with a UFC appearance", "ACTIVE YEARS", "active-years", "longevity"),
  q("longest-ufc-fight-span", "Who has the longest span between their first and latest UFC appearances?", "months between first and latest UFC appearances", "FIGHT SPAN", "fight-span-months", "longevity"),
  q("rematch-wins-all-time", "Who has the most UFC wins in rematches?", "UFC rematch wins", "REMATCH WINS", "rematch-wins", "rivalry"),
  q("avenged-losses-all-time", "Who has avenged the most UFC losses with a later win?", "UFC losses avenged with a later win", "AVENGED LOSSES", "avenged-loss-wins", "rivalry"),
  q("repeat-opponent-wins-all-time", "Who has the most UFC wins against opponents they fought multiple times?", "UFC wins against repeat opponents", "REPEAT WINS", "repeat-opponent-wins", "rivalry"),
  q("wins-after-first-loss-all-time", "Who has the most UFC wins after their first UFC loss?", "UFC wins after first UFC loss", "POST-LOSS WINS", "wins-after-first-loss", "durability"),
  q("bounce-back-wins-all-time", "Who has the most UFC wins immediately following a UFC loss?", "UFC bounce-back wins after a loss", "BOUNCE-BACK WINS", "bounce-back-wins", "durability"),
  q("divisions-with-ufc-win", "Who has earned UFC wins in the most different divisions?", "UFC divisions with a win", "WIN DIVISIONS", "divisions-with-win", "versatility"),
  q("divisions-with-ufc-finish", "Who has earned UFC finishes in the most different divisions?", "UFC divisions with a finish", "FINISH DIVISIONS", "divisions-with-finish", "versatility"),
  q("most-ufc-wins-single-year", "Who has the most UFC wins in their best calendar year?", "most UFC wins in one calendar year", "BEST-YEAR WINS", "best-year-wins", "volume"),
  q("most-ufc-finishes-single-year", "Who has the most UFC finishes in their best calendar year?", "most UFC finishes in one calendar year", "BEST-YEAR FINISHES", "best-year-finishes", "volume"),
  q("most-ufc-wins-one-opponent", "Who has the most UFC wins over a single opponent?", "most UFC wins over one opponent", "RIVALRY WINS", "max-wins-vs-one-opponent", "rivalry"),

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
  return isUfcCareerWin(fight, "scoring");
}

function isFinish(fight: CanonicalFight) {
  return isUfcCareerFinish(fight);
}

function isTitleFight(fight: CanonicalFight) {
  return isUfcCareerTitleFight(fight);
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

function sortedFights(fights: readonly CanonicalFight[]) {
  return [...fights].sort((left, right) => left.date.localeCompare(right.date));
}

function winsBeforeFirstLoss(fights: readonly CanonicalFight[]) {
  let wins = 0;
  for (const fight of sortedFights(fights)) {
    if (fight.scoringDisposition === "count-loss") break;
    if (isCountedWin(fight)) wins += 1;
  }
  return wins;
}

function spanMonths(fights: readonly CanonicalFight[]) {
  const dates = fights.map((fight) => fight.date).sort();
  if (dates.length < 2) return 0;
  const first = Date.parse(`${dates[0]}T00:00:00Z`);
  const last = Date.parse(`${dates.at(-1)}T00:00:00Z`);
  return Math.round((last - first) / (1000 * 60 * 60 * 24 * 30.4375));
}

function winSpanMonths(fights: readonly CanonicalFight[]) {
  return spanMonths(fights.filter(isCountedWin));
}

function countUnique(values: readonly (string | null | undefined)[]) {
  return new Set(values.map(normalized).filter(Boolean)).size;
}

function maxBucket(values: readonly string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const key = normalized(value);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Math.max(0, ...counts.values());
}

function rematchWins(fights: readonly CanonicalFight[]) {
  const seen = new Set<string>();
  let wins = 0;
  sortedFights(fights).forEach((fight) => {
    const opponent = normalized(fight.opponent);
    if (isCountedWin(fight) && seen.has(opponent)) wins += 1;
    seen.add(opponent);
  });
  return wins;
}

function avengedLossWins(fights: readonly CanonicalFight[]) {
  const lostTo = new Set<string>();
  const avenged = new Set<string>();
  sortedFights(fights).forEach((fight) => {
    const opponent = normalized(fight.opponent);
    if (fight.scoringDisposition === "count-loss") lostTo.add(opponent);
    if (isCountedWin(fight) && lostTo.has(opponent)) avenged.add(opponent);
  });
  return avenged.size;
}

function repeatOpponentWins(fights: readonly CanonicalFight[]) {
  const opponentCounts = new Map<string, number>();
  fights.forEach((fight) => {
    const opponent = normalized(fight.opponent);
    opponentCounts.set(opponent, (opponentCounts.get(opponent) ?? 0) + 1);
  });
  return fights.filter((fight) => isCountedWin(fight) && (opponentCounts.get(normalized(fight.opponent)) ?? 0) > 1).length;
}

function winsAfterFirstLoss(fights: readonly CanonicalFight[]) {
  let hasLost = false;
  let wins = 0;
  sortedFights(fights).forEach((fight) => {
    if (hasLost && isCountedWin(fight)) wins += 1;
    if (fight.scoringDisposition === "count-loss") hasLost = true;
  });
  return wins;
}

function bounceBackWins(fights: readonly CanonicalFight[]) {
  const ordered = sortedFights(fights);
  return ordered.filter((fight, index) => (
    isCountedWin(fight) && index > 0 && ordered[index - 1].scoringDisposition === "count-loss"
  )).length;
}

function scoreFighter(input: RankingInputFighter, definition: FindLeaderQuestionDefinition) {
  if (!matchesScope(input, definition)) return null;
  const fights = input.facts.fights.filter((fight) => inWindow(fight, definition));
  const wins = fights.filter(isCountedWin);
  const finishWins = wins.filter(isFinish);
  const stats = deriveUfcCareerStats(fights, "scoring");
  if (definition.minimumWins && stats.wins < definition.minimumWins) return null;

  switch (definition.metric) {
    case "wins": return stats.wins;
    case "finishes": return stats.finishes;
    case "submissions": return stats.submissionWins;
    case "knockouts": return stats.knockoutWins;
    case "decision-wins": return stats.decisionWins;
    case "title-fight-wins": return stats.titleFightWins;
    case "top-five-wins": return wins.filter((fight) => TOP_FIVE_TIERS.has(fight.qualityTier)).length;
    case "ranked-wins": return wins.filter((fight) => RANKED_TIERS.has(fight.qualityTier)).length;
    case "longest-win-streak": return stats.longestWinStreak;
    case "wins-before-first-loss": return winsBeforeFirstLoss(fights);
    case "win-span-months": return winSpanMonths(fights);
    case "finish-rate-pct": return stats.wins ? Math.round((stats.finishes / stats.wins) * 100) : 0;
    case "prime-wins": return deriveUfcCareerStats(primeFights(input), "scoring").wins;
    case "prime-finishes": return deriveUfcCareerStats(primeFights(input), "scoring").finishes;
    case "wins-unfinished": {
      const finishedLoss = fights.some((fight) => fight.scoringDisposition === "count-loss" && isFinish(fight));
      return finishedLoss ? 0 : stats.wins;
    }
    case "main-events": return stats.mainEvents;
    case "bonus-awards": return stats.bonusAwards;
    case "first-round-finishes": return stats.firstRoundFinishes;
    case "knockdowns-landed": return stats.knockdownsFor;
    case "fights": return stats.fights;
    case "title-fights": return stats.titleFights;
    case "title-fight-finishes": return stats.titleFightFinishes;
    case "title-fight-knockouts": return stats.titleFightKnockoutWins;
    case "title-fight-submissions": return stats.titleFightSubmissionWins;
    case "unique-title-opponents-faced": return stats.uniqueTitleOpponentsFaced;
    case "unique-title-opponents-beaten": return stats.uniqueTitleOpponentsBeaten;
    case "unique-opponents-beaten": return stats.uniqueOpponentsBeaten;
    case "unique-opponents-finished": return stats.uniqueOpponentsFinished;
    case "unique-ranked-opponents-beaten": return countUnique(wins.filter((fight) => RANKED_TIERS.has(fight.qualityTier)).map((fight) => fight.opponent));
    case "unique-top-five-opponents-beaten": return countUnique(wins.filter((fight) => TOP_FIVE_TIERS.has(fight.qualityTier)).map((fight) => fight.opponent));
    case "ranked-finishes": return finishWins.filter((fight) => RANKED_TIERS.has(fight.qualityTier)).length;
    case "top-five-finishes": return finishWins.filter((fight) => TOP_FIVE_TIERS.has(fight.qualityTier)).length;
    case "longest-finish-streak": return stats.longestFinishStreak;
    case "longest-ko-streak": return stats.longestKnockoutStreak;
    case "longest-submission-streak": return stats.longestSubmissionStreak;
    case "win-years": return stats.winningYears;
    case "finish-years": return stats.finishYears;
    case "active-years": return stats.activeYears;
    case "fight-span-months": return spanMonths(fights);
    case "rematch-wins": return rematchWins(fights);
    case "avenged-loss-wins": return avengedLossWins(fights);
    case "repeat-opponent-wins": return repeatOpponentWins(fights);
    case "wins-after-first-loss": return winsAfterFirstLoss(fights);
    case "bounce-back-wins": return bounceBackWins(fights);
    case "divisions-with-win": return countUnique(wins.map((fight) => fight.division));
    case "divisions-with-finish": return countUnique(finishWins.map((fight) => fight.division));
    case "best-year-wins": return maxBucket(wins.map((fight) => fight.date.slice(0, 4)));
    case "best-year-finishes": return maxBucket(finishWins.map((fight) => fight.date.slice(0, 4)));
    case "max-wins-vs-one-opponent": return maxBucket(wins.map((fight) => fight.opponent));
  }
}

type ScoredFindLeaderRow = { input: RankingInputFighter; value: number };

function scoredPool(definition: FindLeaderQuestionDefinition): ScoredFindLeaderRow[] {
  return canonicalRankingInputs.fighters
    .map((input) => ({ input, value: scoreFighter(input, definition) }))
    .filter((row): row is ScoredFindLeaderRow => Number.isFinite(row.value))
    .sort((left, right) => right.value - left.value || left.input.fighter.localeCompare(right.input.fighter));
}

const ufcCompetitionConfig = {
  getId: (row: ScoredFindLeaderRow) => row.input.fighter,
  getValue: (row: ScoredFindLeaderRow) => row.value,
  competitiveWindowSize: 10,
  supportEndIndex: 12,
  isLeaderAllowed: (row: ScoredFindLeaderRow) => row.value > 0,
  compareLeaderTie: (left: ScoredFindLeaderRow, right: ScoredFindLeaderRow) => left.input.fighter.localeCompare(right.input.fighter),
};

function playableFindLeaderDefinitions() {
  return findLeaderQuestions.filter((definition) => {
    const pool = scoredPool(definition);
    return pool.length >= 10 && viableCompetitiveLeaders(pool, ufcCompetitionConfig, false).length > 0;
  });
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
  const random = seededLineupRandom(VERSION, seed, definition.id);
  const pool = scoredPool(definition);
  if (pool.length < 10) return null;
  const option = selectFindLeaderCompetition(pool, random, ufcCompetitionConfig);
  if (!option) return null;
  const challengers = option.challengers;
  if (challengers.length !== 9) return null;
  const selected = [option.leader, ...challengers];
  const candidates = shuffleLineup(selected.map((row) => candidateFor(row.input, row.value)), random);
  return {
    version: VERSION,
    day,
    definitionId: definition.id,
    question: `Who leads this group in ${definition.statLabel.replace(/^all-time\s+/i, "")}?`,
    context: `Highest ${definition.statLabel} among the ten fighters shown. The overall UFC record holder does not have to appear.`,
    statLabel: definition.statLabel,
    shortLabel: definition.shortLabel,
    family: definition.family,
    leaderId: option.leader.input.presentation.slug,
    leaderValue: option.leader.value,
    candidates,
  };
}

export function findLeaderCompetitionAudit() {
  return findLeaderQuestions.map((definition) => {
    const pool = scoredPool(definition);
    const board = buildFindLeaderBoard(definition, `competition-audit|${definition.id}`, DAILY_ANCHOR);
    const nonRecordLeaderAvailable = viableCompetitiveLeaders(pool, ufcCompetitionConfig, true).length > 0;
    if (!board) {
      return {
        definitionId: definition.id,
        boardValid: false,
        nonRecordLeaderAvailable,
        leaderIsGlobalMax: false,
        boardSpread: null,
        closestPossibleSpread: null,
        nearContenderCount: 0,
        outsideClosestNineCount: 0,
      };
    }
    const leader = pool.find((row) => row.input.presentation.slug === board.leaderId);
    const lower = leader ? pool.filter((row) => row.value < leader.value) : [];
    const closestPossibleSpread = leader && lower.length >= 9
      ? leader.value - lower[8].value
      : null;
    const closestNineIds = new Set(lower.slice(0, 9).map((row) => row.input.presentation.slug));
    const nearCutoffValue = lower[3]?.value ?? null;
    const challengers = board.candidates.filter((candidate) => candidate.id !== board.leaderId);
    const nearContenderCount = nearCutoffValue === null
      ? 0
      : challengers.filter((candidate) => candidate.value >= nearCutoffValue).length;
    const outsideClosestNineCount = challengers.filter((candidate) => !closestNineIds.has(candidate.id)).length;
    const boardMinimum = Math.min(...board.candidates.map((candidate) => candidate.value));
    return {
      definitionId: definition.id,
      boardValid: true,
      nonRecordLeaderAvailable,
      leaderIsGlobalMax: board.leaderValue === (pool[0]?.value ?? board.leaderValue),
      boardSpread: board.leaderValue - boardMinimum,
      closestPossibleSpread,
      nearContenderCount,
      outsideClosestNineCount,
    };
  });
}

function dayNumber(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, date) / 86_400_000);
}

const FAMILY_CYCLE: readonly FindLeaderFamily[] = [
  "wins", "supplemental", "finishes", "volume", "supplemental", "championship",
  "quality", "supplemental", "streaks", "rivalry", "supplemental", "longevity",
  "versatility", "filtered", "durability", "rates", "era",
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
  const available = findLeaderQuestions.filter((definition) => buildFindLeaderBoard(definition, `audit-${target}`, day));
  const history: string[] = [];
  const available = playableFindLeaderDefinitions();
  let selected: FindLeaderQuestionDefinition | null = null;
  for (let slot = 0; slot <= target; slot += 1) {
    const recent = new Set(history.slice(-NO_REPEAT_SELECTIONS));
    const family = FAMILY_CYCLE[slot % FAMILY_CYCLE.length];
    const preferred = available.filter((definition) => definition.family === family && !recent.has(definition.id));
    const fresh = available.filter((definition) => !recent.has(definition.id));
    const candidates = preferred.length ? preferred : fresh.length ? fresh : available;
    selected = [...candidates].sort((left, right) => stableLineupHash(`${VERSION}|${slot}|${left.id}`) - stableLineupHash(`${VERSION}|${slot}|${right.id}`))[0] ?? null;
    if (selected) history.push(selected.id);
  }
  return selected;
}

export function dailyFindLeaderBoard(day = centralDay()) {
  const definition = scheduledFindLeaderDefinition(day);
  const board = definition ? buildFindLeaderBoard(definition, dailyLineupSeed(day), day) : null;
  return board ? { ...board, version: FIND_LEADER_DAILY_CONTENT_VERSION } : null;
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