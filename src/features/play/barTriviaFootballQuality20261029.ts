/**
 * October 29, 2026 football-specific editorial cut.
 *
 * These are future-selection exclusions only: already-published Daily boards
 * and player result evidence remain immutable.
 *
 * Do not backfill one-for-one merely to satisfy an inventory target.
 * If new material is added, check its distinctive fact/moment against the
 * existing Football Millionaire, Average Fan and Bar Trivia catalogs. That
 * lightweight collision check is not a claim of cross-game certification.
 */
export type FootballBarTriviaQualityReason =
  | "answer-giveaway"
  | "uninteresting-first"
  | "administrative-trivia"
  | "low-value-identity"
  | "obscure-detail";

export const FOOTBALL_BAR_TRIVIA_QUALITY_RETIREMENTS: Readonly<Record<string, FootballBarTriviaQualityReason>> = {
  // NFL — Round 1. A familiar team slogan should not contain the answer itself.
  "nfl-r1-bills-mafia": "answer-giveaway",
  "nfl-r1-raider-nation": "answer-giveaway",
  "nfl-r1-titan-up": "answer-giveaway",
  "nfl-r1-fly-eagles-fly": "answer-giveaway",
  "nfl-r1-first-indoor-super-bowl": "uninteresting-first",
  "nfl-r1-first-mnf-matchup": "uninteresting-first",
  "nfl-r1-first-wild-card-super-bowl-winner": "uninteresting-first",
  "nfl-r1-thanksgiving-third-game": "administrative-trivia",

  // NFL — Round 2. These test footnotes rather than memorable football.
  "nfl-r2-staleys": "obscure-detail",
  "nfl-r2-apfa-renamed": "administrative-trivia",
  "nfl-r2-first-nfl-champion": "uninteresting-first",
  "nfl-r2-instant-replay-regular": "administrative-trivia",
  "nfl-r2-first-game-outside-na": "uninteresting-first",
  "nfl-r2-first-game-europe": "uninteresting-first",
  "nfl-r2-first-super-bowl-pontiac": "uninteresting-first",
  "nfl-r2-first-regular-outside-us-city": "uninteresting-first",
  "nfl-r2-washington-boston-braves": "obscure-detail",
  "nfl-r2-first-wild-card-super-bowl": "uninteresting-first",

  // NFL — Round 3. Deep football knowledge should be about the sport.
  "nfl-r3-first-paid-pro": "obscure-detail",
  "nfl-r3-league-founded-city": "administrative-trivia",
  "nfl-r3-first-two-time-champ": "uninteresting-first",
  "nfl-r3-lombardi-maker": "administrative-trivia",
  "nfl-r3-goalposts-moved": "administrative-trivia",
  "nfl-r3-replay-returned": "administrative-trivia",
  "nfl-r3-extra-point-back": "administrative-trivia",

  // CFB — Round 1. Preserve traditions; cut generic nickname identification.
  "cfb-r1-first-postseason-game": "uninteresting-first",
  "cfb-r1-army-navy-most-host-city": "obscure-detail",
  "cfb-r1-first-cfp-semifinal-bowl": "uninteresting-first",
  "cfb-easy2-razorbacks": "low-value-identity",
  "cfb-easy2-gators": "low-value-identity",
  "cfb-easy2-ducks": "low-value-identity",
  "cfb-easy2-seminoles": "low-value-identity",
  "cfb-easy2-hurricanes": "low-value-identity",
  "cfb-easy2-mountaineers": "low-value-identity",

  // CFB — Round 2.
  "cfb-r2-rose-chariot-races": "obscure-detail",
  "cfb-r2-rose-big-ten-pac-pact": "administrative-trivia",
  "cfb-r2-soldier-field-army-navy": "obscure-detail",
  "cfb-r2-victory-bell-stolen": "obscure-detail",
  "cfb-r2-old-brass-spittoon": "obscure-detail",

  // CFB — Round 3 and Last Call.
  "cfb-r3-first-game": "uninteresting-first",
  "cfb-r3-army-navy-1944-ranking": "obscure-detail",
  "cfb-final-first-ap-champ": "uninteresting-first",
  "cfb-final-choke-at-doak-score": "obscure-detail",
};

export const FOOTBALL_BAR_TRIVIA_QUALITY_RETIRED_IDS: ReadonlySet<string> =
  new Set(Object.keys(FOOTBALL_BAR_TRIVIA_QUALITY_RETIREMENTS));
