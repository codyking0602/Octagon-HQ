import MlbHitTheNumberChallenge, {
  type MlbHitNumberCandidate,
  type MlbHitNumberGame,
} from "./MlbHitTheNumberChallenge";

export type MlbHitNumberOwnerCandidate = MlbHitNumberCandidate;
export type MlbHitNumberOwnerGame = MlbHitNumberGame;

// Disposable owner-review content. These exact boards, targets, and season-card
// combinations are burned after review. A small amount of player overlap with the real
// Oct. 15 game is allowed, but the production pools/targets must be materially different.
// Career totals and single-season HR values are factual and were source-checked when authored.
export const MLB_HIT_NUMBER_OWNER_GAMES: readonly [MlbHitNumberOwnerGame, MlbHitNumberOwnerGame] = [
  {
    id: "mlb-owner-hit-number-career-steroid-era",
    metricLabel: "Career Home Runs",
    configurationLabel: "Steroid Era Sluggers · 1990s / 2000s",
    target: 2680,
    candidates: [
      { id: "owner-bonds", name: "Barry Bonds", subtitle: "Giants", teamAbbreviation: "SF", value: 762 },
      { id: "owner-arod", name: "Alex Rodriguez", subtitle: "Yankees", teamAbbreviation: "NYY", value: 696 },
      { id: "owner-griffey", name: "Ken Griffey Jr.", subtitle: "Mariners", teamAbbreviation: "SEA", value: 630 },
      { id: "owner-thome", name: "Jim Thome", subtitle: "Cleveland", teamAbbreviation: "CLE", value: 612 },
      { id: "owner-sosa", name: "Sammy Sosa", subtitle: "Cubs", teamAbbreviation: "CHC", value: 609 },
      { id: "owner-mcgwire", name: "Mark McGwire", subtitle: "Cardinals", teamAbbreviation: "STL", value: 583 },
      { id: "owner-palmeiro", name: "Rafael Palmeiro", subtitle: "Rangers", teamAbbreviation: "TEX", value: 569 },
      { id: "owner-manny", name: "Manny Ramirez", subtitle: "Red Sox", teamAbbreviation: "BOS", value: 555 },
      { id: "owner-frank-thomas", name: "Frank Thomas", subtitle: "White Sox", teamAbbreviation: "CWS", value: 521 },
      { id: "owner-sheffield", name: "Gary Sheffield", subtitle: "Braves", teamAbbreviation: "ATL", value: 509 },
      { id: "owner-delgado", name: "Carlos Delgado", subtitle: "Blue Jays", teamAbbreviation: "TOR", value: 473 },
      { id: "owner-bagwell", name: "Jeff Bagwell", subtitle: "Astros", teamAbbreviation: "HOU", value: 449 },
      { id: "owner-giambi", name: "Jason Giambi", subtitle: "Yankees", teamAbbreviation: "NYY", value: 440 },
      { id: "owner-juan-gonzalez", name: "Juan Gonzalez", subtitle: "Rangers", teamAbbreviation: "TEX", value: 434 },
    ],
  },
  {
    id: "mlb-owner-hit-number-single-season",
    metricLabel: "Single-Season Home Runs",
    configurationLabel: "Single-Season Bombers",
    target: 280,
    candidates: [
      { id: "owner-judge-2022", name: "Aaron Judge · 2022", subtitle: "Yankees", teamAbbreviation: "NYY", value: 62 },
      { id: "owner-stanton-2017", name: "Giancarlo Stanton · 2017", subtitle: "Marlins", teamAbbreviation: "MIA", value: 59 },
      { id: "owner-howard-2006", name: "Ryan Howard · 2006", subtitle: "Phillies", teamAbbreviation: "PHI", value: 58 },
      { id: "owner-luis-gonzalez-2001", name: "Luis Gonzalez · 2001", subtitle: "Diamondbacks", teamAbbreviation: "ARI", value: 57 },
      { id: "owner-bautista-2010", name: "Jose Bautista · 2010", subtitle: "Blue Jays", teamAbbreviation: "TOR", value: 54 },
      { id: "owner-ortiz-2006", name: "David Ortiz · 2006", subtitle: "Red Sox", teamAbbreviation: "BOS", value: 54 },
      { id: "owner-olson-2023", name: "Matt Olson · 2023", subtitle: "Braves", teamAbbreviation: "ATL", value: 54 },
      { id: "owner-alonso-2019", name: "Pete Alonso · 2019", subtitle: "Mets", teamAbbreviation: "NYM", value: 53 },
      { id: "owner-chris-davis-2013", name: "Chris Davis · 2013", subtitle: "Orioles", teamAbbreviation: "BAL", value: 53 },
      { id: "owner-andruw-jones-2005", name: "Andruw Jones · 2005", subtitle: "Braves", teamAbbreviation: "ATL", value: 51 },
      { id: "owner-prince-fielder-2007", name: "Prince Fielder · 2007", subtitle: "Brewers", teamAbbreviation: "MIL", value: 50 },
      { id: "owner-greg-vaughn-1998", name: "Greg Vaughn · 1998", subtitle: "Padres", teamAbbreviation: "SD", value: 50 },
      { id: "owner-cecil-fielder-1990", name: "Cecil Fielder · 1990", subtitle: "Tigers", teamAbbreviation: "DET", value: 51 },
      { id: "owner-george-foster-1977", name: "George Foster · 1977", subtitle: "Reds", teamAbbreviation: "CIN", value: 52 },
    ],
  },
] as const;

export default function MlbHitTheNumberOwnerRun() {
  return (
    <MlbHitTheNumberChallenge
      mode="owner_review"
      config={{
        challengeKey: "mlb-owner-hit-number-review",
        challengeDate: "2026-10-15",
        version: "mlb-hit-number-owner-v1",
        games: MLB_HIT_NUMBER_OWNER_GAMES,
      }}
    />
  );
}
