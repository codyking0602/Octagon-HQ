import MlbBlindResumeChallenge, {
  type MlbBlindResumeRound,
  type MlbBlindResumeSubject,
} from "./MlbBlindResumeChallenge";

export type MlbBlindResumeOwnerSubject = MlbBlindResumeSubject;
export type MlbBlindResumeOwnerRound = MlbBlindResumeRound;

const subject = (
  id: string,
  name: string,
  teamAbbreviation: string,
  subtitle: string,
): MlbBlindResumeSubject => ({ id, name, teamAbbreviation, subtitle });

const pujols = subject("mlb-owner-blind-resume-pujols", "Albert Pujols", "STL", "Cardinals · Hall of Fame-caliber slugger");
const cabrera = subject("mlb-owner-blind-resume-cabrera", "Miguel Cabrera", "DET", "Tigers · Triple Crown winner");
const sabathia = subject("mlb-owner-blind-resume-sabathia", "CC Sabathia", "NYY", "Yankees · Cy Young winner");
const hamels = subject("mlb-owner-blind-resume-hamels", "Cole Hamels", "PHI", "Phillies · World Series MVP");
const mauer = subject("mlb-owner-blind-resume-mauer", "Joe Mauer", "MIN", "Twins · MVP catcher");
const posey = subject("mlb-owner-blind-resume-posey", "Buster Posey", "SF", "Giants · three-time champion");
const hamilton = subject("mlb-owner-blind-resume-hamilton", "Josh Hamilton", "TEX", "Rangers · AL MVP");
const braun = subject("mlb-owner-blind-resume-braun", "Ryan Braun", "MIL", "Brewers · NL MVP");
const beltre = subject("mlb-owner-blind-resume-beltre", "Adrian Beltre", "TEX", "Rangers · Hall of Fame third baseman");
const rolen = subject("mlb-owner-blind-resume-rolen", "Scott Rolen", "STL", "Cardinals · Hall of Fame third baseman");

// Burned owner-review matchups. Nothing in this card may be reused for the scheduled Oct. 9 challenge.
export const MLB_BLIND_RESUME_OWNER_ROUNDS: readonly MlbBlindResumeRound[] = [
  {
    id: "mlb-owner-br-01",
    playerA: pujols,
    playerB: cabrera,
    winnerId: pujols.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "11", valueB: "12" },
      { label: "CAREER BATTING AVG.", valueA: ".296", valueB: ".306" },
      { label: "CAREER HITS", valueA: "3,384", valueB: "3,174" },
      { label: "CAREER HOME RUNS", valueA: "703", valueB: "511" },
      { label: "MVP AWARDS", valueA: "3", valueB: "2" },
      { label: "WORLD SERIES TITLES", valueA: "2", valueB: "1" },
      { label: "CAREER RBI", valueA: "2,218", valueB: "1,881" },
      { label: "CAREER WAR", valueA: "101.2", valueB: "67.2" },
    ],
  },
  {
    id: "mlb-owner-br-02",
    playerA: sabathia,
    playerB: hamels,
    winnerId: sabathia.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "6", valueB: "4" },
      { label: "CAREER ERA", valueA: "3.74", valueB: "3.43" },
      { label: "CAREER WINS", valueA: "251", valueB: "163" },
      { label: "CAREER STRIKEOUTS", valueA: "3,093", valueB: "2,560" },
      { label: "CY YOUNG AWARDS", valueA: "1", valueB: "0" },
      { label: "WORLD SERIES TITLES", valueA: "1", valueB: "1" },
      { label: "CAREER INNINGS", valueA: "3,577.1", valueB: "2,698.0" },
      { label: "CAREER WAR", valueA: "62.3", valueB: "59.0" },
    ],
  },
  {
    id: "mlb-owner-br-03",
    playerA: mauer,
    playerB: posey,
    winnerId: mauer.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "6", valueB: "7" },
      { label: "CAREER BATTING AVG.", valueA: ".306", valueB: ".302" },
      { label: "CAREER HITS", valueA: "2,123", valueB: "1,500" },
      { label: "CAREER HOME RUNS", valueA: "143", valueB: "158" },
      { label: "MVP AWARDS", valueA: "1", valueB: "1" },
      { label: "GOLD GLOVES", valueA: "3", valueB: "1" },
      { label: "WORLD SERIES TITLES", valueA: "0", valueB: "3" },
      { label: "CAREER WAR", valueA: "55.6", valueB: "45.0" },
    ],
  },
  {
    id: "mlb-owner-br-04",
    playerA: hamilton,
    playerB: braun,
    winnerId: braun.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "5", valueB: "6" },
      { label: "CAREER BATTING AVG.", valueA: ".290", valueB: ".296" },
      { label: "CAREER HITS", valueA: "1,134", valueB: "1,963" },
      { label: "CAREER HOME RUNS", valueA: "200", valueB: "352" },
      { label: "MVP AWARDS", valueA: "1", valueB: "1" },
      { label: "SILVER SLUGGERS", valueA: "3", valueB: "5" },
      { label: "CAREER RBI", valueA: "701", valueB: "1,154" },
      { label: "CAREER WAR", valueA: "28.1", valueB: "47.2" },
    ],
  },
  {
    id: "mlb-owner-br-05",
    playerA: beltre,
    playerB: rolen,
    winnerId: beltre.id,
    stats: [
      { label: "ALL-STAR SELECTIONS", valueA: "4", valueB: "7" },
      { label: "CAREER BATTING AVG.", valueA: ".286", valueB: ".281" },
      { label: "CAREER HITS", valueA: "3,166", valueB: "2,077" },
      { label: "CAREER HOME RUNS", valueA: "477", valueB: "316" },
      { label: "GOLD GLOVES", valueA: "5", valueB: "8" },
      { label: "CAREER RBI", valueA: "1,707", valueB: "1,287" },
      { label: "SEASONS PLAYED", valueA: "21", valueB: "17" },
      { label: "CAREER WAR", valueA: "93.7", valueB: "70.1" },
    ],
  },
] as const;

const OWNER_DAY = "2026-10-09";
const OWNER_SCHEDULE_VERSION = "mlb-blind-resume-owner-run-v1";

export default function MlbBlindResumeOwnerRun() {
  return (
    <MlbBlindResumeChallenge
      rounds={MLB_BLIND_RESUME_OWNER_ROUNDS}
      challengeDate={OWNER_DAY}
      scheduleVersion={OWNER_SCHEDULE_VERSION}
    />
  );
}
