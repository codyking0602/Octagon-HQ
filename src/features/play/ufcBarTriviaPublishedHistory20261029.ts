/**
 * Immutable, read-only UFC Bar Trivia Daily IDs from actual production
 * private.daily_challenges -> private.daily_challenge_setups publications.
 * Reconciled on 2026-10-29. Never rewrite a published board or attempt.
 *
 * Source-of-truth cutover snapshot: every UFC Bar Trivia publication through
 * 2026-10-29. Refresh when future bank migrations diverge from saved boards.
 */
export const UFC_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER: readonly {
  day: string;
  scheduleVersion: string;
  contentVersion: string;
  questionIds: readonly string[];
}[] = [
  {
    day: "2026-09-29",
    scheduleVersion: "play-rotation-v17-bar-trivia-sep29",
    contentVersion: "bar-trivia-daily-v1",
    questionIds: [
      "ufc-current-2026-09-19-sharaf-steveson",
      "ufc-current-2026-09-19-joshua-van-pantoja",
      "ufc-r1-thug-rose",
      "ufc-easy2-youngest-champ",
      "ufc-r1-tuf5-winner",
      "ufc-r2-ufc38-main-winner",
      "ufc-r3-last-down-knees",
      "ufc-r3-ufc205-main-finish",
      "ufc-r3-newton-title-event",
      "ufc-final-smith-sell-comeback",
    ],
  },
  {
    day: "2026-10-05",
    scheduleVersion: "play-rotation-v20-resume-v18-oct3",
    contentVersion: "bar-trivia-daily-v1",
    questionIds: [
      "ufc-current-2026-09-19-joshua-van-pantoja",
      "ufc-easy2-lioness",
      "ufc-easy2-youngest-champ",
      "ufc-easy-leon-usman",
      "ufc-current-2026-09-26-akylbek-tuf-dq",
      "ufc-r1-first-145-fight",
      "ufc-r3-last-groin-shot",
      "ufc-r3-hof-jones-gus-location",
      "ufc-r3-last-gi",
      "ufc-final-first-australia-date",
    ],
  },
  {
    day: "2026-10-07",
    scheduleVersion: "play-rotation-v20-resume-v18-oct3",
    contentVersion: "bar-trivia-daily-v1",
    questionIds: [
      "ufc-current-2026-09-26-tina-black-tuf",
      "ufc-r1-bones",
      "ufc-easy2-nunes-rousey",
      "ufc-r1-rogan-role",
      "ufc-current-2026-09-19-chito-jourdain",
      "ufc-r1-first-170-fight",
      "ufc-r3-hof-hughes-trigg",
      "ufc-r3-ufc-japan-year",
      "ufc-r3-mir-sylvia-arm",
      "ufc-final-first-ufc-name-purpose",
    ],
  },
  {
    day: "2026-10-24",
    scheduleVersion: "play-rotation-v20-resume-v18-oct3",
    contentVersion: "bar-trivia-daily-v2-recent-rotation",
    questionIds: [
      "ufc-current-2026-10-17-malott-buckley",
      "ufc-easy-fastest-ko-opponent",
      "ufc-r1-tuf1-lhw",
      "ufc-r1-cowboy",
      "ufc-current-2026-10-10-allen-duncan",
      "ufc-r2-ufc83-main-result",
      "ufc-r3-bustamante-ufc-debut",
      "ufc-r3-ufc180-interim",
      "ufc-r3-fight-island-year",
      "ufc-final-ufc1-name-mistake",
    ],
  },
];

/** IDs from saved past games, not re-generated simulations. */
export function ufcPublishedBarTriviaIdsBeforeDay(day: string, lookbackDays: number): string[] {
  const target = Date.parse(`${day}T12:00:00.000Z`);
  const ids = new Set<string>();
  for (const board of UFC_BAR_TRIVIA_PUBLISHED_PRE_CUTOVER) {
    const published = Date.parse(`${board.day}T12:00:00.000Z`);
    const distance = (target - published) / 86_400_000;
    if (distance > 0 && distance <= lookbackDays) {
      for (const id of board.questionIds) ids.add(id);
    }
  }
  return [...ids];
}
