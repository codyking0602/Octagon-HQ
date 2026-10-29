/**
 * Immutable IDs read from actual published Football Bar Trivia Daily setups.
 *
 * The v3 generator replays a simulated history using today's curated bank.
 * That replay does NOT reconstruct past saved setups and allowed a real
 * September 29 question to reappear on October 29. These exact snapshots
 * close that cutover gap without changing any past board/attempt/grade.
 *
 * Source: private.daily_challenges + private.daily_challenge_setups
 * read-only reconciliation on 2026-10-29. Future authored-bank revisions must
 * likewise reconcile any published history not represented by deterministic replay.
 */
export const FOOTBALL_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER = [
  {
    day: "2026-09-29",
    league: "nfl",
    questionIds: [
      "nfl-current-2026-w1-bears-panthers-record",
      "nfl-r1-cheeseheads",
      "nfl-easy2-holmes-catch",
      "nfl-easy2-lincoln-financial",
      "nfl-current-2026-w1-harbaugh-giants-debut",
      "nfl-r2-first-game-outside-na",
      "nfl-r3-two-point-added",
      "nfl-r3-first-female-official",
      "nfl-r3-first-super-bowl-home-team",
      "nfl-final-kicker-mvp",
    ],
  },
  {
    day: "2026-10-01",
    league: "cfb",
    questionIds: [
      "cfb-current-2026-w4-jeremiah-smith-3000",
      "cfb-current-2026-w2-oklahoma-state-oregon",
      "cfb-r1-osceola-renegade",
      "cfb-easy2-longhorns",
      "cfb-r2-1996-florida-title",
      "cfb-r2-1988-national-champion",
      "cfb-r3-2009-fiesta-undefeated",
      "cfb-r3-first-heisman",
      "cfb-r3-head-ball-coach",
      "cfb-final-first-ap-champ",
    ],
  },
  {
    day: "2026-10-14",
    league: "nfl",
    questionIds: [
      "nfl-current-2026-w5-commanders-clock-tie",
      "nfl-current-2026-w4-keenum-bears-eagles",
      "nfl-r1-thanksgiving",
      "nfl-r1-12s-seattle",
      "nfl-r2-fail-mary",
      "nfl-r2-beebe-lett-chase",
      "nfl-r3-music-city",
      "nfl-r3-president-at-game",
      "nfl-r3-first-two-point",
      "nfl-final-chiefs-first-super-bowl-win-opponent",
    ],
  },
  {
    day: "2026-10-22",
    league: "cfb",
    questionIds: [
      "cfb-current-2026-w5-northwestern-ryan-field",
      "cfb-current-2026-w6-oklahoma-red-river",
      "cfb-r1-miami-smoke",
      "cfb-easy2-cyclones",
      "cfb-r2-1992-national-champion",
      "cfb-r1-hang-on-sloopy",
      "cfb-r3-bowden-program",
      "cfb-r3-2010-auburn-heisman",
      "cfb-r3-beamer-ball",
      "cfb-final-bluegrass-miracle-qb",
    ],
  },
  {
    day: "2026-10-29",
    league: "nfl",
    questionIds: [
      "nfl-current-2026-w7-first-france-game",
      "nfl-current-2026-w6-titans-colts-upset",
      "nfl-r1-bills-mafia",
      "nfl-easy2-fleur-de-lis",
      "nfl-r2-first-game-outside-na",
      "nfl-r1-first-wild-card-super-bowl-winner",
      "nfl-r3-first-black-modern-hc",
      "nfl-r3-league-founded-city",
      "nfl-r3-regular-season-ot",
      "nfl-final-first-sb-kick-return-td",
    ],
  },
] as const;

export function footballPublishedBarTriviaIdsBeforeDay(
  league: "nfl" | "cfb",
  candidateDay: string,
  lookbackDays: number,
): string[] {
  const candidateAt = new Date(candidateDay + "T12:00:00.000Z").getTime();
  if (!Number.isFinite(candidateAt) || candidateDay < "2026-10-29") return [];
  const dayMs = 86_400_000;
  return FOOTBALL_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER.filter((row) => {
    // Only the owner-approved Oct 29 relaunch also excludes its own
    // superseded published board. Future days retain strict before-day checks.
    const supersededSameDay = candidateDay === "2026-10-29" && row.day === candidateDay;
    if (row.league !== league || (row.day >= candidateDay && !supersededSameDay)) return false;
    const publishedAt = new Date(row.day + "T12:00:00.000Z").getTime();
    return candidateAt - publishedAt <= lookbackDays * dayMs;
  }).flatMap((row) => [...row.questionIds]);
}
