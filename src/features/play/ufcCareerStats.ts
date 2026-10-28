import type { CanonicalFight, UfcBonusType } from "../rankings/engine/schemas";

const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);
const KO_TKO_METHODS = new Set(["ko-tko", "doctor-stoppage"]);
const TITLE_FIGHT_TYPES = new Set([
  "normal",
  "interim",
  "vacant-undisputed",
  "second-division-undisputed",
  "vacant-second-division",
]);

export type UfcCareerWinMode = "official" | "scoring";

export interface UfcCareerStats {
  fights: number;
  wins: number;
  decisionWins: number;
  finishes: number;
  koTkoWins: number;
  knockoutWins: number;
  submissionWins: number;
  titleFights: number;
  titleFightWins: number;
  titleFightFinishes: number;
  titleFightKnockoutWins: number;
  titleFightSubmissionWins: number;
  activeYears: number;
  winningYears: number;
  finishYears: number;
  longestWinStreak: number;
  longestFinishStreak: number;
  longestKnockoutStreak: number;
  longestSubmissionStreak: number;
  uniqueTitleOpponentsFaced: number;
  uniqueTitleOpponentsBeaten: number;
  uniqueOpponentsBeaten: number;
  uniqueOpponentsFinished: number;
  mainEvents: number | null;
  bonusAwards: number | null;
  bonusAwardsByType: Record<UfcBonusType, number> | null;
  firstRoundFinishes: number | null;
  knockdownsFor: number | null;
  knockdownsAgainst: number | null;
}

export function isUfcCareerWin(fight: CanonicalFight, winMode: UfcCareerWinMode) {
  return winMode === "official"
    ? fight.officialResult === "win"
    : fight.scoringDisposition === "count-win";
}

export function isUfcCareerFinish(fight: CanonicalFight) {
  return FINISH_METHODS.has(fight.methodCategory);
}

export function isUfcCareerTitleFight(fight: CanonicalFight) {
  return TITLE_FIGHT_TYPES.has(fight.championshipType) && fight.championshipEligible !== false;
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function distinctCount(values: readonly string[]) {
  return new Set(values.map(normalized).filter(Boolean)).size;
}

function orderedFights(fights: readonly CanonicalFight[]) {
  return [...fights].sort(
    (left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id),
  );
}

function longestMatchingStreak(
  fights: readonly CanonicalFight[],
  predicate: (fight: CanonicalFight) => boolean,
) {
  let current = 0;
  let longest = 0;
  orderedFights(fights).forEach((fight) => {
    if (predicate(fight)) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });
  return longest;
}

function verifiedMainEvents(fights: readonly CanonicalFight[]) {
  if (fights.some((fight) => fight.supplementalFacts?.mainEvent.status !== "verified")) return null;
  return fights.filter((fight) => (
    fight.supplementalFacts?.mainEvent.status === "verified"
    && fight.supplementalFacts.mainEvent.value
  )).length;
}

function verifiedBonuses(fights: readonly CanonicalFight[]) {
  if (fights.some((fight) => fight.supplementalFacts?.bonuses.status !== "verified")) return null;

  const byType: Record<UfcBonusType, number> = {
    "fight-of-the-night": 0,
    "performance-of-the-night": 0,
    "knockout-of-the-night": 0,
    "submission-of-the-night": 0,
  };
  let total = 0;

  fights.forEach((fight) => {
    if (fight.supplementalFacts?.bonuses.status !== "verified") return;
    fight.supplementalFacts.bonuses.values.forEach((bonus) => {
      byType[bonus] += 1;
      total += 1;
    });
  });

  return { total, byType };
}

function verifiedFirstRoundFinishes(
  finishWins: readonly CanonicalFight[],
) {
  if (finishWins.some((fight) => fight.supplementalFacts?.finish.status !== "verified")) return null;
  return finishWins.filter((fight) => (
    fight.supplementalFacts?.finish.status === "verified"
    && fight.supplementalFacts.finish.round === 1
  )).length;
}

function verifiedKnockdowns(fights: readonly CanonicalFight[]) {
  if (fights.some((fight) => fight.supplementalFacts?.knockdowns.status !== "verified")) return null;

  return fights.reduce(
    (totals, fight) => {
      if (fight.supplementalFacts?.knockdowns.status !== "verified") return totals;
      totals.for += fight.supplementalFacts.knockdowns.for;
      totals.against += fight.supplementalFacts.knockdowns.against;
      return totals;
    },
    { for: 0, against: 0 },
  );
}

/**
 * Canonical UFC career-stat derivation shared by games. It consumes the ranked
 * fighter fight ledger directly and never owns a second fighter-stat table.
 *
 * Supplemental UFCStats aggregates remain null when any required fight fact is
 * unavailable. Unknown historical data is never silently converted to zero.
 */
export function deriveUfcCareerStats(
  fights: readonly CanonicalFight[],
  winMode: UfcCareerWinMode = "official",
): UfcCareerStats {
  const wins = fights.filter((fight) => isUfcCareerWin(fight, winMode));
  const finishWins = wins.filter(isUfcCareerFinish);
  const titleFights = fights.filter(isUfcCareerTitleFight);
  const titleWins = wins.filter(isUfcCareerTitleFight);
  const titleFinishWins = titleWins.filter(isUfcCareerFinish);
  const bonuses = verifiedBonuses(fights);
  const knockdowns = verifiedKnockdowns(fights);

  return {
    fights: fights.length,
    wins: wins.length,
    decisionWins: wins.filter((fight) => fight.methodCategory === "decision").length,
    finishes: finishWins.length,
    koTkoWins: wins.filter((fight) => KO_TKO_METHODS.has(fight.methodCategory)).length,
    knockoutWins: wins.filter((fight) => fight.methodCategory === "ko-tko").length,
    submissionWins: wins.filter((fight) => fight.methodCategory === "submission").length,
    titleFights: titleFights.length,
    titleFightWins: titleWins.length,
    titleFightFinishes: titleFinishWins.length,
    titleFightKnockoutWins: titleWins.filter((fight) => fight.methodCategory === "ko-tko").length,
    titleFightSubmissionWins: titleWins.filter((fight) => fight.methodCategory === "submission").length,
    activeYears: distinctCount(fights.map((fight) => fight.date.slice(0, 4))),
    winningYears: distinctCount(wins.map((fight) => fight.date.slice(0, 4))),
    finishYears: distinctCount(finishWins.map((fight) => fight.date.slice(0, 4))),
    longestWinStreak: longestMatchingStreak(fights, (fight) => isUfcCareerWin(fight, winMode)),
    longestFinishStreak: longestMatchingStreak(
      fights,
      (fight) => isUfcCareerWin(fight, winMode) && isUfcCareerFinish(fight),
    ),
    longestKnockoutStreak: longestMatchingStreak(
      fights,
      (fight) => isUfcCareerWin(fight, winMode) && fight.methodCategory === "ko-tko",
    ),
    longestSubmissionStreak: longestMatchingStreak(
      fights,
      (fight) => isUfcCareerWin(fight, winMode) && fight.methodCategory === "submission",
    ),
    uniqueTitleOpponentsFaced: distinctCount(titleFights.map((fight) => fight.opponent)),
    uniqueTitleOpponentsBeaten: distinctCount(titleWins.map((fight) => fight.opponent)),
    uniqueOpponentsBeaten: distinctCount(wins.map((fight) => fight.opponent)),
    uniqueOpponentsFinished: distinctCount(finishWins.map((fight) => fight.opponent)),
    mainEvents: verifiedMainEvents(fights),
    bonusAwards: bonuses?.total ?? null,
    bonusAwardsByType: bonuses?.byType ?? null,
    firstRoundFinishes: verifiedFirstRoundFinishes(finishWins),
    knockdownsFor: knockdowns?.for ?? null,
    knockdownsAgainst: knockdowns?.against ?? null,
  };
}
