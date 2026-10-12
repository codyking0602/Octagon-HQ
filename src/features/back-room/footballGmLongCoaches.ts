import type { NflGmLongSlot } from "./footballGmLongFoundation";

export const NFL_GM_LONG_COACH_BUCKETS = ["offensive", "defensive", "developer", "culture"] as const;
export type NflGmLongCoachBucket = typeof NFL_GM_LONG_COACH_BUCKETS[number];

export interface NflGmLongCoach {
  team: string;
  name: string;
  bucket: NflGmLongCoachBucket;
  strengths: string;
  limitation: string;
  /**
   * Editorial fit coefficients rather than overall boosts:
   * passing, rushing, front-seven disruption, coverage, development, chemistry.
   */
  focus: readonly [passing: number, rushing: number, front: number, coverage: number, development: number, culture: number];
}

/**
 * 2026 clubs/coaches checked against the 2026-10-06 NFL head-coach directory:
 * https://profootballmania.com/nfl-head-coaches/
 * Buckets and tactical effects are editorial game-design choices, not factual
 * NFL performance statistics. The 12/7/5/8 population is intentional.
 */
export const NFL_GM_LONG_COACHES: readonly NflGmLongCoach[] = [
  // Offensive Architect — 12
  { team: "ARI", name: "Mike LaFleur", bucket: "offensive", strengths: "Motion and route spacing", limitation: "Young head coach; results still unproven", focus: [1.15, 0.45, 0, 0, 0.25, 0.1] },
  { team: "ATL", name: "Kevin Stefanski", bucket: "offensive", strengths: "Play action and under-center balance", limitation: "Less explosive without a reliable run threat", focus: [0.7, 1.15, 0, 0, 0.15, 0.15] },
  { team: "BUF", name: "Joe Brady", bucket: "offensive", strengths: "QB-friendly spacing and improvisation", limitation: "Less established head-coaching résumé", focus: [1.2, 0.35, 0, 0, 0.55, 0.1] },
  { team: "CHI", name: "Ben Johnson", bucket: "offensive", strengths: "Designed explosive plays and offensive line integration", limitation: "Execution-sensitive, complex scheme", focus: [1.15, 0.9, 0, 0, 0.3, 0] },
  { team: "DEN", name: "Sean Payton", bucket: "offensive", strengths: "QB decisions and structured passing", limitation: "Scheme asks plenty of QB processing", focus: [1.4, 0.2, 0, 0, 0.3, 0.15] },
  { team: "GB", name: "Matt LaFleur", bucket: "offensive", strengths: "Play-action timing and run/pass balance", limitation: "Less potent without coordinated protection", focus: [0.85, 0.95, 0, 0, 0.2, 0.2] },
  { team: "JAX", name: "Liam Coen", bucket: "offensive", strengths: "Play-action passing and layered route concepts", limitation: "QB timing and protection dependencies", focus: [1.1, 0.65, 0, 0, 0.3, 0] },
  { team: "KC", name: "Andy Reid", bucket: "offensive", strengths: "Passing answers, QB creation and situational planning", limitation: "Less value from ground-only roster construction", focus: [1.55, 0.1, 0, 0, 0.1, 0.45] },
  { team: "LV", name: "Klint Kubiak", bucket: "offensive", strengths: "Wide zone, boot action and rushing rhythm", limitation: "Less proven when the run foundation collapses", focus: [0.55, 1.3, 0, 0, 0.15, 0.05] },
  { team: "LAR", name: "Sean McVay", bucket: "offensive", strengths: "Passing structure and receiver matchups", limitation: "Requires reliable QB/receiver execution", focus: [1.5, 0.3, 0, 0, 0.2, 0.05] },
  { team: "NO", name: "Kellen Moore", bucket: "offensive", strengths: "Downfield concepts and wide-receiver deployment", limitation: "Can be one-dimensional without the line", focus: [1.25, 0.35, 0, 0, 0.25, 0] },
  { team: "SF", name: "Kyle Shanahan", bucket: "offensive", strengths: "Run-game geometry and yards-after-catch creation", limitation: "Strongest with a committed run and protection identity", focus: [0.65, 1.5, 0, 0, 0.2, 0.1] },
  // Defensive Architect — 7
  { team: "BAL", name: "Jesse Minter", bucket: "defensive", strengths: "Disguise and complementary pressure packages", limitation: "Scheme communication matters against quick passing", focus: [0, 0, 1.05, 1.0, 0.2, 0.1] },
  { team: "HOU", name: "DeMeco Ryans", bucket: "defensive", strengths: "Front-seven speed, tackling and pursuit", limitation: "Pass rush must reach home for maximum value", focus: [0, 0, 1.55, 0.35, 0.25, 0.3] },
  { team: "MIA", name: "Jeff Hafley", bucket: "defensive", strengths: "Coverage communication and secondary structure", limitation: "Requires secondary cohesion", focus: [0, 0, 0.45, 1.2, 0.25, 0.1] },
  { team: "NYJ", name: "Aaron Glenn", bucket: "defensive", strengths: "Physical secondary play and man-coverage confidence", limitation: "Aggressive coverage can expose mismatches", focus: [0, 0, 0.35, 1.35, 0.25, 0.25] },
  { team: "SEA", name: "Mike Macdonald", bucket: "defensive", strengths: "Rotating coverages, secondary disguise and pressure timing", limitation: "Communication-heavy coverage checks", focus: [0, 0, 0.55, 1.65, 0.2, 0.05] },
  { team: "TB", name: "Todd Bowles", bucket: "defensive", strengths: "Pressure creation and blitz variation", limitation: "Aggression can leave the secondary exposed", focus: [0, 0, 1.5, 0.35, 0.1, 0] },
  { team: "TEN", name: "Robert Saleh", bucket: "defensive", strengths: "Four-man rush and front-seven coordination", limitation: "Coverage needs a steady pass rush", focus: [0, 0, 1.3, 0.55, 0.2, 0.3] },
  // Player Developer — 5
  { team: "CAR", name: "Dave Canales", bucket: "developer", strengths: "QB confidence and individual offensive progression", limitation: "Still establishing a winning program", focus: [0.35, 0.1, 0, 0, 1.45, 0.1] },
  { team: "CLE", name: "Todd Monken", bucket: "developer", strengths: "QB adaptation and flexible offensive teaching", limitation: "New staff cohesion may take time", focus: [0.45, 0.2, 0, 0, 1.2, 0.15] },
  { team: "IND", name: "Shane Steichen", bucket: "developer", strengths: "Mobile-QB concepts and tailored teaching", limitation: "Variable results without consistent QB decisions", focus: [0.55, 0.15, 0, 0, 1.3, 0.05] },
  { team: "MIN", name: "Kevin O'Connell", bucket: "developer", strengths: "Quarterback mentorship and precision passing progression", limitation: "Pass-heavy talent mix is most effective", focus: [0.55, 0.0, 0, 0, 1.45, 0.1] },
  { team: "PIT", name: "Mike McCarthy", bucket: "developer", strengths: "Veteran QB teaching and repeatable structure", limitation: "Less dynamic scheme when talent stalls", focus: [0.25, 0.25, 0, 0, 1.1, 0.45] },
  // Culture & Leadership — 8
  { team: "CIN", name: "Zac Taylor", bucket: "culture", strengths: "QB partnership and locker-room continuity", limitation: "Talent mismatches are not solved by stability alone", focus: [0.2, 0, 0, 0, 0.15, 1.2] },
  { team: "DAL", name: "Brian Schottenheimer", bucket: "culture", strengths: "Veteran relationships and offensive continuity", limitation: "Unproven postseason program as lead coach", focus: [0.05, 0.3, 0, 0, 0.1, 1.2] },
  { team: "DET", name: "Dan Campbell", bucket: "culture", strengths: "Physicality, buy-in and late-game resilience", limitation: "Aggressive decisions can amplify volatility", focus: [0, 0.35, 0.15, 0, 0.3, 1.5] },
  { team: "LAC", name: "Jim Harbaugh", bucket: "culture", strengths: "Physical preparation and long-term program structure", limitation: "Offense can grow conservative", focus: [0, 0.45, 0.15, 0, 0.3, 1.4] },
  { team: "NE", name: "Mike Vrabel", bucket: "culture", strengths: "Accountability, resilience and veteran integration", limitation: "Passing upside depends more directly on roster", focus: [0, 0.25, 0.25, 0, 0.15, 1.65] },
  { team: "NYG", name: "John Harbaugh", bucket: "culture", strengths: "Situational judgment and organizational steadiness", limitation: "Needs capable coordinators for maximum scheme upside", focus: [0.1, 0.15, 0.1, 0.1, 0.15, 1.45] },
  { team: "PHI", name: "Nick Sirianni", bucket: "culture", strengths: "Player relationships and high-pressure readiness", limitation: "Strong roster talent remains essential", focus: [0.1, 0.15, 0, 0, 0.1, 1.5] },
  { team: "WSH", name: "Dan Quinn", bucket: "culture", strengths: "Positive standards and defensive-player buy-in", limitation: "Can lose schematic edge against creative attacks", focus: [0, 0, 0.25, 0.2, 0.2, 1.35] },
];

export function nflGmLongCoachesInBucket(bucket: NflGmLongCoachBucket): readonly NflGmLongCoach[] {
  return NFL_GM_LONG_COACHES.filter(coach => coach.bucket === bucket);
}

/** A caller-supplied uniform [0,1) random draw ensures each name is equally likely. */
export function nflGmLongSpinCoach(bucket: NflGmLongCoachBucket, draw: number): NflGmLongCoach {
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new Error("Coach wheel requires a uniform [0,1) random draw.");
  const eligible = nflGmLongCoachesInBucket(bucket);
  if (!eligible.length) throw new Error("Empty coaching category.");
  return eligible[Math.floor(draw * eligible.length)]!;
}

export interface NflGmLongCoachingRosterEntry {
  slot: NflGmLongSlot;
  grade: number;
  age: number;
  role?: "T" | "G" | "C" | "RB" | "WR" | "TE" | "EDGE" | "IDL" | "LB" | "CB" | "S";
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function quality(rows: readonly NflGmLongCoachingRosterEntry[], slots: readonly NflGmLongSlot[]) {
  const selected = rows.filter(row => slots.includes(row.slot));
  return selected.length ? selected.reduce((sum, row) => sum + clamp((row.grade - 75) / 24, 0, 1), 0) / selected.length : 0;
}

/**
 * Returns contextual percentage-point shifts, NOT ratings. Season engines can
 * consume these without changing a player's HQ grade, development ceiling, or
 * $205M spend. No injury mechanic exists.
 */
export function nflGmLongCoachEffects(coach: NflGmLongCoach, roster: readonly NflGmLongCoachingRosterEntry[]) {
  const [pass, run, front, coverage, development, culture] = coach.focus;
  const qb = quality(roster, ["QB"]);
  const weapons = quality(roster, ["WR", "FLEX"]);
  const line = quality(roster, ["OL"]);
  const runningBack = quality(roster, ["RB"]);
  const rushUnit = (runningBack + line) / 2;
  const passUnit = qb * 0.5 + weapons * 0.3 + line * 0.2;
  const frontUnit = quality(roster, ["DL", "LB"]);
  const secondary = quality(roster, ["DB", "DB2"]);
  const young = roster.length ? roster.filter(row => row.age <= 26).length / roster.length : 0;
  const stable = roster.length ? roster.filter(row => row.age >= 27 && row.age <= 32).length / roster.length : 0;
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    passingMatchupPct: round(pass * passUnit * 5),
    rushingMatchupPct: round(run * rushUnit * 5),
    pressurePct: round(front * frontUnit * 5),
    coveragePct: round(coverage * secondary * 5),
    developmentOpportunityPct: round(development * young * 5),
    chemistryResiliencePct: round(culture * (0.5 + stable * 0.5) * 4),
  };
}
