import type { MlbHitNumberChallengeConfig } from "./MlbHitTheNumberChallenge";

export const MLB_HIT_NUMBER_PRODUCTION_CHALLENGE_KEY = "mlb-2026-play-07" as const;
export const MLB_HIT_NUMBER_PRODUCTION_DATE = "2026-10-15" as const;
export const MLB_HIT_NUMBER_PRODUCTION_VERSION = "mlb-hit-number-oct15-v1" as const;

// Spoiler-protected production content for Oct. 15. Keep this separate from the
// disposable owner-review boards. The second board deliberately uses only
// immediately recognizable baseball stars after owner review feedback.
export const MLB_HIT_NUMBER_PRODUCTION_CONFIG: MlbHitNumberChallengeConfig = {
  challengeKey: MLB_HIT_NUMBER_PRODUCTION_CHALLENGE_KEY,
  challengeDate: MLB_HIT_NUMBER_PRODUCTION_DATE,
  version: MLB_HIT_NUMBER_PRODUCTION_VERSION,
  games: [
    {
      id: "mlb-oct15-career-era-sluggers",
      metricLabel: "Career Home Runs",
      configurationLabel: "Steroid Era Sluggers · 1990s / 2000s",
      target: 2350,
      candidates: [
        { id: "oct15-pujols-career", name: "Albert Pujols", subtitle: "Cardinals", teamAbbreviation: "STL", value: 703 },
        { id: "oct15-ortiz-career", name: "David Ortiz", subtitle: "Red Sox", teamAbbreviation: "BOS", value: 541 },
        { id: "oct15-cabrera-career", name: "Miguel Cabrera", subtitle: "Tigers", teamAbbreviation: "DET", value: 511 },
        { id: "oct15-mcgriff-career", name: "Fred McGriff", subtitle: "Braves", teamAbbreviation: "ATL", value: 493 },
        { id: "oct15-beltre-career", name: "Adrian Beltre", subtitle: "Rangers", teamAbbreviation: "TEX", value: 477 },
        { id: "oct15-chipper-career", name: "Chipper Jones", subtitle: "Braves", teamAbbreviation: "ATL", value: 468 },
        { id: "oct15-dunn-career", name: "Adam Dunn", subtitle: "Reds", teamAbbreviation: "CIN", value: 462 },
        { id: "oct15-vlad-career", name: "Vladimir Guerrero", subtitle: "Angels", teamAbbreviation: "LAA", value: 449 },
        { id: "oct15-beltran-career", name: "Carlos Beltran", subtitle: "Mets", teamAbbreviation: "NYM", value: 435 },
        { id: "oct15-andruw-career", name: "Andruw Jones", subtitle: "Braves", teamAbbreviation: "ATL", value: 434 },
        { id: "oct15-piazza-career", name: "Mike Piazza", subtitle: "Mets", teamAbbreviation: "NYM", value: 427 },
        { id: "oct15-soriano-career", name: "Alfonso Soriano", subtitle: "Yankees", teamAbbreviation: "NYY", value: 412 },
        { id: "oct15-howard-career", name: "Ryan Howard", subtitle: "Phillies", teamAbbreviation: "PHI", value: 382 },
        { id: "oct15-fielder-career", name: "Prince Fielder", subtitle: "Brewers", teamAbbreviation: "MIL", value: 319 },
      ],
    },
    {
      id: "mlb-oct15-iconic-single-season",
      metricLabel: "Single-Season Home Runs",
      configurationLabel: "Iconic Single-Season Bombers",
      target: 300,
      candidates: [
        { id: "oct15-bonds-2001", name: "Barry Bonds · 2001", subtitle: "Giants", teamAbbreviation: "SF", value: 73 },
        { id: "oct15-mcgwire-1998", name: "Mark McGwire · 1998", subtitle: "Cardinals", teamAbbreviation: "STL", value: 70 },
        { id: "oct15-sosa-1998", name: "Sammy Sosa · 1998", subtitle: "Cubs", teamAbbreviation: "CHC", value: 66 },
        { id: "oct15-maris-1961", name: "Roger Maris · 1961", subtitle: "Yankees", teamAbbreviation: "NYY", value: 61 },
        { id: "oct15-ruth-1927", name: "Babe Ruth · 1927", subtitle: "Yankees", teamAbbreviation: "NYY", value: 60 },
        { id: "oct15-judge-2024", name: "Aaron Judge · 2024", subtitle: "Yankees", teamAbbreviation: "NYY", value: 58 },
        { id: "oct15-arod-2002", name: "Alex Rodriguez · 2002", subtitle: "Rangers", teamAbbreviation: "TEX", value: 57 },
        { id: "oct15-griffey-1997", name: "Ken Griffey Jr. · 1997", subtitle: "Mariners", teamAbbreviation: "SEA", value: 56 },
        { id: "oct15-ohtani-2024", name: "Shohei Ohtani · 2024", subtitle: "Dodgers", teamAbbreviation: "LAD", value: 54 },
        { id: "oct15-mantle-1961", name: "Mickey Mantle · 1961", subtitle: "Yankees", teamAbbreviation: "NYY", value: 54 },
        { id: "oct15-mays-1965", name: "Willie Mays · 1965", subtitle: "Giants", teamAbbreviation: "SF", value: 52 },
        { id: "oct15-thome-2002", name: "Jim Thome · 2002", subtitle: "Cleveland", teamAbbreviation: "CLE", value: 52 },
        { id: "oct15-pujols-2006", name: "Albert Pujols · 2006", subtitle: "Cardinals", teamAbbreviation: "STL", value: 49 },
        { id: "oct15-ortiz-2005", name: "David Ortiz · 2005", subtitle: "Red Sox", teamAbbreviation: "BOS", value: 47 },
      ],
    },
  ],
};

export const MLB_HIT_NUMBER_PRODUCTION_SOURCE_NOTES = [
  {
    scope: "career-home-runs",
    authority: "MLB.com",
    url: "https://www.mlb.com/news/members-of-the-500-home-run-club/",
  },
  {
    scope: "career-home-runs-player-pages",
    authority: "MLB.com",
    url: "https://www.mlb.com/stats/all-time-totals/home-runs",
  },
  {
    scope: "single-season-home-runs",
    authority: "MLB.com",
    url: "https://www.mlb.com/news/mlb-single-season-home-run-record",
  },
  {
    scope: "single-season-team-records",
    authority: "MLB.com",
    url: "https://www.mlb.com/news/each-mlb-team-s-single-season-home-run-leader",
  },
] as const;
