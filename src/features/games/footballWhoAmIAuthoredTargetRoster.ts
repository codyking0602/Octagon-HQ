import type { FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
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

export interface FootballWhoAmIAuthoredTargetIdentity {
  league: FootballWhoAmIAuthoredTargetLeague;
  subjectId: string;
  name: string;
  kind: "player" | "coach";
}

export const FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS = {
  NFL: [
    { subjectId: "justin-jefferson", name: "Justin Jefferson" },
    { subjectId: "derrick-henry", name: "Derrick Henry" },
    { subjectId: "saquon-barkley", name: "Saquon Barkley" },
    { subjectId: "myles-garrett", name: "Myles Garrett" },
    { subjectId: "tj-watt", name: "T.J. Watt" },
    { subjectId: "joe-burrow", name: "Joe Burrow" },
    { subjectId: "micah-parsons", name: "Micah Parsons" },
    { subjectId: "tyreek-hill", name: "Tyreek Hill" },
    { subjectId: "patrick-surtain-ii", name: "Patrick Surtain II" },
    { subjectId: "jamarr-chase", name: "Ja'Marr Chase" },
    { subjectId: "george-kittle", name: "George Kittle" },
    { subjectId: "maxx-crosby", name: "Maxx Crosby" },
    { subjectId: "amon-ra-st-brown", name: "Amon-Ra St. Brown" },
    { subjectId: "jayden-daniels", name: "Jayden Daniels" },
    { subjectId: "jahmyr-gibbs", name: "Jahmyr Gibbs" },
  ],
  CFB: [
    { subjectId: "cfb-michael-vick", name: "Michael Vick" },
    { subjectId: "cfb-trevor-lawrence", name: "Trevor Lawrence" },
    { subjectId: "cfb-jalen-hurts", name: "Jalen Hurts" },
    { subjectId: "cfb-tua-tagovailoa", name: "Tua Tagovailoa" },
    { subjectId: "cfb-kyler-murray", name: "Kyler Murray" },
    { subjectId: "cfb-marcus-mariota", name: "Marcus Mariota" },
    { subjectId: "cfb-robert-griffin-iii", name: "Robert Griffin III" },
    { subjectId: "cfb-jameis-winston", name: "Jameis Winston" },
    { subjectId: "cfb-sam-bradford", name: "Sam Bradford" },
    { subjectId: "cfb-mark-ingram", name: "Mark Ingram" },
    { subjectId: "cfb-justin-fields", name: "Justin Fields" },
    { subjectId: "cfb-jayden-daniels", name: "Jayden Daniels" },
    { subjectId: "cfb-stetson-bennett", name: "Stetson Bennett" },
    { subjectId: "cfb-bo-nix", name: "Bo Nix" },
    { subjectId: "cfb-kellen-moore", name: "Kellen Moore" },
  ],
} as const satisfies Record<
  FootballWhoAmIAuthoredTargetLeague,
  readonly { subjectId: string; name: string }[]
>;

export const FOOTBALL_WHO_AM_I_AUTHORED_EXPLICIT_OUT = {
  NFL: [] as const,
  CFB: ["Peter Warrick", "Eric Crouch", "Chris Weinke"] as const,
} satisfies Record<FootballWhoAmIAuthoredTargetLeague, readonly string[]>;

function normalizedName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

const strictKeep: Readonly<Record<FootballWhoAmIAuthoredTargetLeague, ReadonlySet<string>>> = {
  NFL: new Set(NFL_STRICT_PRE_2000_KEEP.map(normalizedName)),
  CFB: new Set(CFB_STRICT_PRE_2000_KEEP.map(normalizedName)),
};

const crossoverKeep: Readonly<Record<FootballWhoAmIAuthoredTargetLeague, ReadonlySet<string>>> = {
  NFL: new Set(NFL_CROSSOVER_KEEP.map(normalizedName)),
  CFB: new Set(CFB_CROSSOVER_KEEP.map(normalizedName)),
};

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
function targetIdentity(
  league: FootballWhoAmIAuthoredTargetLeague,
  subject: FootballSubjectProfile,
): FootballWhoAmIAuthoredTargetIdentity {
  return {
    league,
    subjectId: subject.id,
    name: subject.name,
    kind: subject.kind === "coach" ? "coach" : "player",
  };
}

export function footballWhoAmIAuthoredTargetAudit(
  league: FootballWhoAmIAuthoredTargetLeague,
) {
  const legacy = getFootballWhoAmILaunchPool(league);
  return legacy.players.map((subject) => ({
    subjectId: subject.id,
    name: subject.name,
    startSeason: subject.startSeason ?? null,
    endSeason: subject.endSeason ?? null,
    retained: keepAuditedBasePlayer(league, subject),
  }));
}

export function footballWhoAmIAuthoredTargetRoster(
  league: FootballWhoAmIAuthoredTargetLeague,
) {
  const legacy = getFootballWhoAmILaunchPool(league);
  const retainedPlayers = legacy.players
    .filter((subject) => keepAuditedBasePlayer(league, subject))
    .map((subject) => targetIdentity(league, subject));
  const additions = FOOTBALL_WHO_AM_I_AUTHORED_APPROVED_ADDITIONS[league]
    .map((entry): FootballWhoAmIAuthoredTargetIdentity => ({
      league,
      subjectId: entry.subjectId,
      name: entry.name,
      kind: "player",
    }));

  const playersById = new Map(
    [...retainedPlayers, ...additions].map((subject) => [subject.subjectId, subject] as const),
  );
  const players = [...playersById.values()];
  const coaches = legacy.coaches.map((subject) => targetIdentity(league, subject));

  return {
    league,
    players,
    coaches,
    subjects: [...players, ...coaches],
  } as const;
}
