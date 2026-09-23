import { queryFootballSubjects, type FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import { getFootballWhoAmILaunchPool } from "./footballWhoAmIAuthority";

export type FootballWhoAmIAuthoredTargetLeague = "NFL" | "CFB";

const NFL_STRICT_PRE_2000_KEEP = [
  "Joe Namath",
  "Joe Greene",
  "O.J. Simpson",
  "Roger Staubach",
  "Terry Bradshaw",
  "Drew Pearson",
  "Walter Payton",
  "Tony Dorsett",
  "Earl Campbell",
  "Joe Montana",
  "Lawrence Taylor",
  "Ronnie Lott",
  "Marcus Allen",
  "Eric Dickerson",
  "Dan Marino",
  "John Elway",
  "Steve Young",
  "Charles Haley",
  "Jim Kelly",
  "Barry Sanders",
  "Mike Ditka",
] as const;

const NFL_CROSSOVER_KEEP = [
  "Brett Favre",
  "Brian Dawkins",
  "Champ Bailey",
  "Charles Woodson",
  "Cris Carter",
  "Deion Sanders",
  "Emmitt Smith",
  "Jerry Rice",
  "Kurt Warner",
  "Marshall Faulk",
  "Peyton Manning",
  "Randy Moss",
  "Ray Lewis",
  "Shannon Sharpe",
  "Terrell Owens",
  "Tony Gonzalez",
  "Troy Aikman",
] as const;

const CFB_STRICT_PRE_2000_KEEP = [
  "O.J. Simpson",
  "Archie Griffin",
  "Earl Campbell",
  "Herschel Walker",
  "Doug Flutie",
  "Bo Jackson",
  "Deion Sanders",
  "Barry Sanders",
  "Desmond Howard",
  "Charlie Ward",
  "Eddie George",
  "Danny Wuerffel",
  "Charles Woodson",
  "Ricky Williams",
  "Champ Bailey",
  "Brian Urlacher",
] as const;

const CFB_CROSSOVER_KEEP = [
  "Carson Palmer",
  "Drew Brees",
  "Ed Reed",
  "Jeremy Shockey",
  "Julius Peppers",
  "LaDainian Tomlinson",
] as const;

export const FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS = {
  NFL: [
    "Justin Jefferson",
    "Derrick Henry",
    "Saquon Barkley",
    "Myles Garrett",
    "T.J. Watt",
    "Joe Burrow",
    "Micah Parsons",
    "Tyreek Hill",
    "Patrick Surtain II",
    "Ja'Marr Chase",
    "George Kittle",
    "Maxx Crosby",
    "Amon-Ra St. Brown",
    "Jayden Daniels",
    "Jahmyr Gibbs",
  ],
  CFB: [
    "Michael Vick",
    "Trevor Lawrence",
    "Jalen Hurts",
    "Tua Tagovailoa",
    "Kyler Murray",
    "Marcus Mariota",
    "Robert Griffin III",
    "Jameis Winston",
    "Sam Bradford",
    "Mark Ingram",
    "Justin Fields",
    "Jayden Daniels",
    "Stetson Bennett",
    "Bo Nix",
    "Kellen Moore",
  ],
} as const satisfies Record<FootballWhoAmIAuthoredTargetLeague, readonly string[]>;

export const FOOTBALL_WHO_AM_I_AUTHORED_EXPLICIT_OUT = {
  NFL: [] as const,
  CFB: ["Peter Warrick", "Eric Crouch", "Chris Weinke"] as const,
} satisfies Record<FootballWhoAmIAuthoredTargetLeague, readonly string[]>;

function normalizedName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

const strictKeep = {
  NFL: new Set(NFL_STRICT_PRE_2000_KEEP.map(normalizedName)),
  CFB: new Set(CFB_STRICT_PRE_2000_KEEP.map(normalizedName)),
} as const;

const crossoverKeep = {
  NFL: new Set(NFL_CROSSOVER_KEEP.map(normalizedName)),
  CFB: new Set(CFB_CROSSOVER_KEEP.map(normalizedName)),
} as const;

function keepAuditedBasePlayer(
  league: FootballWhoAmIAuthoredTargetLeague,
  subject: FootballSubjectProfile,
) {
  if (subject.kind !== "player-career") return false;
  const name = normalizedName(subject.name);
  if (subject.endSeason != null && subject.endSeason <= 1999) {
    return strictKeep[league].has(name);
  }
  if (
    subject.startSeason != null
    && subject.startSeason < 2000
    && (subject.endSeason == null || subject.endSeason >= 2000)
  ) {
    return crossoverKeep[league].has(name);
  }
  return true;
}

function canonicalApprovedAddition(
  league: FootballWhoAmIAuthoredTargetLeague,
  name: string,
) {
  const wanted = normalizedName(name);
  const matches = queryFootballSubjects({ league, kind: "player-career" })
    .filter((subject) => normalizedName(subject.name) === wanted);
  if (matches.length !== 1) {
    throw new Error(
      `Approved ${league} Who Am I addition ${name} must resolve to exactly one canonical player; found ${matches.length}.`,
    );
  }
  return matches[0]!;
}

/**
 * Product-owned reconstruction of Cody's final Football Who Am I roster audit.
 *
 * The old 180-player launch pool is only the input census:
 * - strict pre-2000 players: retain only the approved KEEP list
 * - crossover players (started before 2000, continued in 2000+): retain only KEEP
 * - modern players: retain the existing pool
 * - add the 15 separately approved modern identities per league
 * - preserve all 20 existing head coaches per league
 *
 * Callers should freeze this result into authored coverage rather than restoring
 * the obsolete 180-player / 200-identity target.
 */
export function footballWhoAmIAuthoredTargetRoster(
  league: FootballWhoAmIAuthoredTargetLeague,
) {
  const legacy = getFootballWhoAmILaunchPool(league);
  const retainedPlayers = legacy.players.filter((subject) => keepAuditedBasePlayer(league, subject));
  const additions = FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS[league]
    .map((name) => canonicalApprovedAddition(league, name));

  const playersById = new Map(
    [...retainedPlayers, ...additions].map((subject) => [subject.id, subject] as const),
  );
  const players = [...playersById.values()];

  return {
    league,
    players,
    coaches: [...legacy.coaches],
    subjects: [...players, ...legacy.coaches],
  } as const;
}
