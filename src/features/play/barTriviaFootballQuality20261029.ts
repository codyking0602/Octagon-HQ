import type { BarTriviaRound } from "../games/barTriviaEngine";

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
  | "obscure-detail"
  | "cross-game-repeat";

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
  // Additional pool-by-pool review: keep the recognizable football history,
  // remove mascot decoding, irrelevant broadcast footnotes and non-football firsts.
  "nfl-r1-falcons-name-contest": "low-value-identity",
  "nfl-r1-colts-name-horses": "low-value-identity",
  "nfl-r1-patriots-boston": "low-value-identity",
  "nfl-r1-rams-cleveland": "low-value-identity",
  "nfl-easy2-silver-black": "low-value-identity",
  "nfl-easy2-fleur-de-lis": "low-value-identity",
  "nfl-easy2-dawg-pound": "low-value-identity",
  "nfl-r1-gang-green": "low-value-identity",
  "nfl-r1-big-blue": "low-value-identity",
  "nfl-r2-sb1-two-networks": "administrative-trivia",
  "nfl-r2-left-shark": "administrative-trivia",
  "nfl-r2-wardrobe-malfunction": "administrative-trivia",
  "nfl-r3-nfl-films-founder": "administrative-trivia",
  "nfl-r3-two-point-added": "administrative-trivia",
  "nfl-r3-first-two-point": "uninteresting-first",
  "nfl-final-spartans": "obscure-detail",
  "nfl-final-broncos-first-afl-win": "uninteresting-first",
  "nfl-final-the-duke-namesake": "obscure-detail",
  "nfl-final-first-sb-kick-return-td": "uninteresting-first",

  "cfb-easy2-spartans": "low-value-identity",
  "cfb-easy2-fighting-illini": "low-value-identity",
  "cfb-easy2-jayhawks": "low-value-identity",
  "cfb-easy2-yellow-jackets": "low-value-identity",
  "cfb-easy2-kstate-wildcats": "low-value-identity",
  "cfb-easy2-hawkeyes": "low-value-identity",
  "cfb-easy2-badgers": "low-value-identity",
  "cfb-easy2-cyclones": "low-value-identity",
  "cfb-easy2-red-raiders": "low-value-identity",
  "cfb-easy2-horned-frogs": "low-value-identity",
  "cfb-easy2-gamecocks": "low-value-identity",
  "cfb-easy2-hokies": "low-value-identity",
  "cfb-easy2-okstate-cowboys": "low-value-identity",
  "cfb-r1-pistol-pete": "low-value-identity",
  "cfb-r1-superfrog": "low-value-identity",
  "cfb-r1-mountaineer-musket": "low-value-identity",
  "cfb-r1-bill-goat": "low-value-identity",
  "cfb-r1-peruna": "low-value-identity",
  "cfb-r1-fifth-quarter": "low-value-identity",
  "cfb-r1-boilermaker-special": "low-value-identity",
  "cfb-r3-cfp-first-semifinal-shutout": "uninteresting-first",
  "cfb-r3-cfp-semifinal-first-2ot": "uninteresting-first",
  "cfb-r3-kinnick-death": "obscure-detail",
  // Lightweight cross-game pass: exact/near-exact facts also in Average Fan.
  "nfl-r1-megatron": "cross-game-repeat",
  "nfl-r1-prime-time": "cross-game-repeat",
  "nfl-easy-beast-mode": "cross-game-repeat",
  "nfl-easy-gronk": "cross-game-repeat",
  "nfl-r3-hester-kickoff": "cross-game-repeat",
  "nfl-r2-wide-right-norwood": "cross-game-repeat",
  "cfb-v2-final-kick-six": "cross-game-repeat",
  "cfb-r3-little-brown-jug": "cross-game-repeat",
  "cfb-r3-2008-utah-sugar": "cross-game-repeat",
  // Final-round quality: no obscure first-draft trivia or duplicate Max McGee.
  "nfl-final-cowboys-first-draft": "uninteresting-first",
  "nfl-final-first-super-bowl-td": "cross-game-repeat",
  "nfl-final-chiefs-first-super-bowl-win-opponent": "uninteresting-first",
  // Hard rounds should test players and plays, not radio or film history.
  "nfl-r3-radio-helmet-coach": "administrative-trivia",
  "nfl-r3-first-mnf-announcer-cosell": "administrative-trivia",
  "nfl-r3-nfl-films-voice": "administrative-trivia",
  "nfl-r3-gatorade-dump-team": "administrative-trivia",
};

export const FOOTBALL_BAR_TRIVIA_QUALITY_RETIRED_IDS: ReadonlySet<string> =
  new Set(Object.keys(FOOTBALL_BAR_TRIVIA_QUALITY_RETIREMENTS));

/** Rebalance difficulty using ALREADY-AUTHORED notable football plays. */
export const FOOTBALL_BAR_TRIVIA_QUALITY_ROUND_OVERRIDES: Readonly<Record<string, BarTriviaRound>> = {
  "nfl-r2-fog-bowl": "round3",
  "nfl-r2-river-city-relay-miss": "round3",
  "nfl-r2-1958-ot-title": "round3",
  "nfl-r2-holy-roller-opponent": "round3",
  "nfl-r2-1998-thanksgiving-moss-opponent": "round3",
  "nfl-r2-music-city-lateral": "round3",
  "nfl-r2-beebe-lett-chase": "round3",
  "nfl-r2-tebow-ot-receiver": "round3",
  "nfl-r2-1998-thanksgiving-coin": "round3",
  "nfl-r2-we-want-ball": "round3",
  "nfl-r2-freezer-bowl": "round3",
  "nfl-r1-lambeau-leap-originator": "round3",
  "nfl-r3-walter-payton-award": "round2",
  "cfb-r3-war-eagle": "round2",
};
