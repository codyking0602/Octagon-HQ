import type {
  MlbBlindResumeRound,
  MlbBlindResumeSubject,
} from "./MlbBlindResumeChallenge";

export const MLB_BLIND_RESUME_PRODUCTION_DATE = "2026-10-09" as const;
export const MLB_BLIND_RESUME_PRODUCTION_CHALLENGE_KEY = "mlb-2026-play-05" as const;
export const MLB_BLIND_RESUME_PRODUCTION_SCHEDULE_VERSION = "mlb-blind-resume-oct9-v1" as const;

const subject = (
  id: string,
  name: string,
  teamAbbreviation: string,
  subtitle: string,
): MlbBlindResumeSubject => ({ id, name, teamAbbreviation, subtitle });

const clemens = subject("mlb-roger-clemens", "Roger Clemens", "BOS", "Red Sox/Yankees · seven-time Cy Young winner");
const maddux = subject("mlb-greg-maddux", "Greg Maddux", "ATL", "Braves · four-time Cy Young winner");
const santana = subject("mlb-johan-santana", "Johan Santana", "MIN", "Twins · two-time Cy Young winner");
const halladay = subject("mlb-roy-halladay", "Roy Halladay", "TOR", "Blue Jays/Phillies · two-time Cy Young winner");
const ramirez = subject("mlb-manny-ramirez", "Manny Ramirez", "BOS", "Red Sox · World Series MVP");
const guerrero = subject("mlb-vladimir-guerrero", "Vladimir Guerrero", "LAA", "Angels · AL MVP");
const jeter = subject("mlb-derek-jeter", "Derek Jeter", "NYY", "Yankees · five-time World Series champion");
const chipper = subject("mlb-chipper-jones", "Chipper Jones", "ATL", "Braves · NL MVP");
const thome = subject("mlb-jim-thome", "Jim Thome", "CLE", "Cleveland · 600-home-run club");
const helton = subject("mlb-todd-helton", "Todd Helton", "COL", "Rockies · Hall of Fame first baseman");

/**
 * Spoiler-protected October 9 production card.
 * The five owner-review matchups are permanently burned and excluded here.
 * Winner identity is anchored to Baseball-Reference career WAR; earlier rows
 * intentionally create the Blind Resume decision before WAR is revealed.
 */
export const MLB_BLIND_RESUME_PRODUCTION_ROUNDS: readonly MlbBlindResumeRound[] = [
  {
    id: "mlb-oct9-br-01",
    playerA: clemens,
    playerB: maddux,
    winnerId: clemens.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "11", valueB: "8" },
      { label: "CAREER ERA", valueA: "3.12", valueB: "3.16" },
      { label: "CAREER WINS", valueA: "354", valueB: "355" },
      { label: "CAREER STRIKEOUTS", valueA: "4,672", valueB: "3,371" },
      { label: "CY YOUNG AWARDS", valueA: "7", valueB: "4" },
      { label: "WORLD SERIES TITLES", valueA: "2", valueB: "1" },
      { label: "GOLD GLOVES", valueA: "0", valueB: "18" },
      { label: "CAREER WAR", valueA: "139.2", valueB: "106.6" },
    ],
  },
  {
    id: "mlb-oct9-br-02",
    playerA: santana,
    playerB: halladay,
    winnerId: halladay.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "4", valueB: "8" },
      { label: "CAREER ERA", valueA: "3.20", valueB: "3.38" },
      { label: "CAREER WINS", valueA: "139", valueB: "203" },
      { label: "CAREER STRIKEOUTS", valueA: "1,988", valueB: "2,117" },
      { label: "CY YOUNG AWARDS", valueA: "2", valueB: "2" },
      { label: "COMPLETE GAMES", valueA: "15", valueB: "67" },
      { label: "SHUTOUTS", valueA: "10", valueB: "20" },
      { label: "CAREER WAR", valueA: "51.7", valueB: "64.2" },
    ],
  },
  {
    id: "mlb-oct9-br-03",
    playerA: ramirez,
    playerB: guerrero,
    winnerId: ramirez.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "12", valueB: "9" },
      { label: "CAREER BATTING AVG.", valueA: ".312", valueB: ".318" },
      { label: "CAREER HITS", valueA: "2,574", valueB: "2,590" },
      { label: "CAREER HOME RUNS", valueA: "555", valueB: "449" },
      { label: "CAREER RBI", valueA: "1,831", valueB: "1,496" },
      { label: "CAREER OBP", valueA: ".411", valueB: ".379" },
      { label: "WORLD SERIES TITLES", valueA: "2", valueB: "0" },
      { label: "CAREER WAR", valueA: "69.3", valueB: "59.5" },
    ],
  },
  {
    id: "mlb-oct9-br-04",
    playerA: jeter,
    playerB: chipper,
    winnerId: chipper.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "14", valueB: "8" },
      { label: "CAREER BATTING AVG.", valueA: ".310", valueB: ".303" },
      { label: "CAREER HITS", valueA: "3,465", valueB: "2,726" },
      { label: "CAREER HOME RUNS", valueA: "260", valueB: "468" },
      { label: "CAREER RBI", valueA: "1,311", valueB: "1,623" },
      { label: "CAREER OBP", valueA: ".377", valueB: ".401" },
      { label: "WORLD SERIES TITLES", valueA: "5", valueB: "1" },
      { label: "CAREER WAR", valueA: "71.3", valueB: "85.3" },
    ],
  },
  {
    id: "mlb-oct9-br-05",
    playerA: thome,
    playerB: helton,
    winnerId: thome.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "5", valueB: "5" },
      { label: "CAREER BATTING AVG.", valueA: ".276", valueB: ".316" },
      { label: "CAREER HITS", valueA: "2,328", valueB: "2,519" },
      { label: "CAREER HOME RUNS", valueA: "612", valueB: "369" },
      { label: "CAREER RBI", valueA: "1,699", valueB: "1,406" },
      { label: "CAREER OBP", valueA: ".402", valueB: ".414" },
      { label: "CAREER OPS", valueA: ".956", valueB: ".953" },
      { label: "CAREER WAR", valueA: "72.9", valueB: "61.8" },
    ],
  },
] as const;

export const MLB_BLIND_RESUME_PRODUCTION_SOURCE_NOTES = [
  { player: "Roger Clemens", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/c/clemero02.shtml", verifiedAt: "2026-09-25" },
  { player: "Greg Maddux", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/m/maddugr01.shtml", verifiedAt: "2026-09-25" },
  { player: "Johan Santana", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/s/santajo02.shtml", verifiedAt: "2026-09-25" },
  { player: "Roy Halladay", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/h/hallaro01.shtml", verifiedAt: "2026-09-25" },
  { player: "Manny Ramirez", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/r/ramirma02.shtml", verifiedAt: "2026-09-25" },
  { player: "Vladimir Guerrero", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/g/guerrvl01.shtml", verifiedAt: "2026-09-25" },
  { player: "Derek Jeter", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/j/jeterde01.shtml", verifiedAt: "2026-09-25" },
  { player: "Chipper Jones", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/j/jonesch06.shtml", verifiedAt: "2026-09-25" },
  { player: "Jim Thome", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/t/thomeji01.shtml", verifiedAt: "2026-09-25" },
  { player: "Todd Helton", authority: "Baseball-Reference", url: "https://www.baseball-reference.com/players/h/heltoto01.shtml", verifiedAt: "2026-09-25" },
] as const;
