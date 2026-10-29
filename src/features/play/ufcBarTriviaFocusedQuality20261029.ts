import type { BarTriviaRound } from "../games/barTriviaEngine";

/**
 * Quality-first UFC follow-up to the already completed v3 rebuild.
 * Future question selection only; prior saved setups/reveals remain immutable.
 */
export const UFC_BAR_TRIVIA_FOCUSED_RETIREMENTS: Readonly<Record<string, string>> = {
  "ufc-r1-zuffa-first-event": "ownership-company recall, not an entertaining fight fact",
  "ufc-r2-zuffa-purchase-year": "administrative acquisition year; repeats the same Zuffa history",
  "ufc-r1-first-canada-event": "first-event city footnote rather than an iconic fight",
  "ufc-r1-first-australia-event": "another first-event host-city footnote",
  "ufc-r1-first-europe-event": "first-event location question; UFC 38 fight knowledge remains",
  "ufc-r2-ufc129-city": "host-city minutia instead of the memorable UFC 129 fights",
  "ufc-r2-russia-debut-city": "first-event host-city minutia; Oleinik-Hunt fight remains",
  "ufc-r3-fight-island-year": "easy pandemic-era calendar recall posing as a medium challenge",
  "ufc-r3-tuf1-network": "broadcast-network administration rather than TUF fight history",
  "ufc-r1-rogan-role": "broadcast job-title filler, not combat-sports entertainment",
  "ufc-r1-anik-role": "second broadcast job-title filler",
  "ufc-easy-home-base": "generic headquarters-city recall with no notable UFC moment",
  "ufc-final-hof-contributor-cofounder": "committee/Contributor Wing trivia is a weak Last Call finale",
  "ufc-bt-v3-f-014": "first-Germany-event main-event identity is low-impact Last Call filler",
};

/** Retain the answer, plausible options, and source-backed fight itself. */
export const UFC_BAR_TRIVIA_FOCUSED_PROMPT_OVERRIDES: Readonly<Record<string, string>> = {
  "ufc-r2-first-womens-hof-fight":
    "Which famous 2020 UFC title fight became the first women's bout inducted into the UFC Hall of Fame Fight Wing in 2026?",
};

/** Claim-matched primary sources; fixes a Cejudo item mistakenly linked to a WEC Pettis story. */
export const UFC_BAR_TRIVIA_FOCUSED_SOURCE_OVERRIDES: Readonly<Record<string, string>> = {
  "ufc-bt-v3-e-001": "https://www.ufc.com/news/ufc-signs-olympic-gold-winner-cejudo",
  "ufc-r2-first-womens-hof-fight":
    "https://www.ufc.com/news/ufc-248-fight-between-zhang-weili-and-joanna-jedrzejczyk-to-be-inducted-into-ufc-hall-fame",
};

/** Correct a previously misgraded old broadcast-history/era entry only if retained. */
export const UFC_BAR_TRIVIA_FOCUSED_ROUND_OVERRIDES: Readonly<Record<string, BarTriviaRound>> = {};
