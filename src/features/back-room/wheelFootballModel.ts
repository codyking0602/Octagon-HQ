import {
  footballNflTeamMediaCode,
  footballNflTeamMediaId,
} from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";
import { footballTeamSchoolMetadata } from "./footballTeamSchoolMetadata";
import {
  WHEEL_FOOTBALL_NFL_PRIORITY_CAPS,
  wheelFootballNflNamesMatch,
  wheelFootballNflPriorityForTeam,
} from "./wheelFootballNflPriority";
import {
  CFB_CURRENT_SCHOOLS_2026,
  type CfbCurrentSchoolConference,
} from "./footballCfbCurrentSchoolScope";
import {
  wheelFootballCfbNamesMatch,
  wheelFootballCfbPriorityForSchoolId,
} from "./wheelFootballCfbPriority";

export const WHEEL_FOOTBALL_ROSTER_SLOTS = [
  "QB",
  "RB",
  "WR",
  "Flex",
  "Front Seven",
  "Secondary",
  "Head Coach",
] as const;

export type WheelFootballRosterSlot = (typeof WHEEL_FOOTBALL_ROSTER_SLOTS)[number];
export type WheelFootballPoolScope =
  | "NFL"
  | "AFC"
  | "NFC"
  | "DIVISION"
  | "CFB"
  | "SEC"
  | "BIG_TEN"
  | "BIG_12"
  | "ACC";

export type WheelFootballLeague = "NFL" | "CFB";

export const WHEEL_FOOTBALL_DIVISIONS = [
  "AFC East",
  "AFC North",
  "AFC South",
  "AFC West",
  "NFC East",
  "NFC North",
  "NFC South",
  "NFC West",
] as const;

export type WheelFootballDivision = (typeof WHEEL_FOOTBALL_DIVISIONS)[number];

export interface WheelFootballTeam {
  code: string;
  shortCode: string;
  name: string;
  league: WheelFootballLeague;
  conference: "AFC" | "NFC" | CfbCurrentSchoolConference;
  division: "East" | "North" | "South" | "West" | null;
  logoSrc: string | null;
  primaryColor: string;
  secondaryColor: string;
  espnId?: string;
}

const NFL_WHEEL_COLORS: Readonly<Record<string, readonly [string, string]>> = {
  ARI: ["#97233F", "#000000"],
  ATL: ["#A71930", "#000000"],
  BAL: ["#241773", "#9E7C0C"],
  BUF: ["#00338D", "#C60C30"],
  CAR: ["#0085CA", "#101820"],
  CHI: ["#0B162A", "#C83803"],
  CIN: ["#FB4F14", "#000000"],
  CLE: ["#311D00", "#FF3C00"],
  DAL: ["#003594", "#869397"],
  DEN: ["#FB4F14", "#002244"],
  DET: ["#0076B6", "#B0B7BC"],
  GB: ["#203731", "#FFB612"],
  HOU: ["#03202F", "#A71930"],
  IND: ["#002C5F", "#A2AAAD"],
  JAX: ["#006778", "#D7A22A"],
  KC: ["#E31837", "#FFB81C"],
  LV: ["#000000", "#A5ACAF"],
  LAC: ["#0080C6", "#FFC20E"],
  LAR: ["#003594", "#FFA300"],
  MIA: ["#008E97", "#FC4C02"],
  MIN: ["#4F2683", "#FFC62F"],
  NE: ["#002244", "#C60C30"],
  NO: ["#D3BC8D", "#101820"],
  NYG: ["#0B2265", "#A71930"],
  NYJ: ["#125740", "#FFFFFF"],
  PHI: ["#004C54", "#A5ACAF"],
  PIT: ["#FFB612", "#101820"],
  SF: ["#AA0000", "#B3995D"],
  SEA: ["#002244", "#69BE28"],
  TB: ["#D50A0A", "#FF7900"],
  TEN: ["#0C2340", "#4B92DB"],
  WSH: ["#5A1414", "#FFB612"],
};

function nflTeamCode(row: (typeof footballTeamSchoolMetadata)[number]) {
  const alias = row.aliases?.find((value) => /^[A-Z]{2,3}$/.test(value));
  if (!alias) throw new Error(`Missing NFL code for ${row.name}`);
  return footballNflTeamMediaCode(alias).toUpperCase();
}

const wheelFootballNflTeams: readonly WheelFootballTeam[] = footballTeamSchoolMetadata
  .filter((row) => row.level === "NFL" && row.nflConference && row.nflDivision)
  .map((row) => {
    const code = nflTeamCode(row);
    const [primaryColor, secondaryColor] = NFL_WHEEL_COLORS[code] ?? ["#174A7E", "#8FC8F4"];
    return {
      code,
      shortCode: code,
      name: row.name,
      league: "NFL" as const,
      conference: row.nflConference!,
      division: row.nflDivision!,
      logoSrc: footballTeamAssets[footballNflTeamMediaId(code)]?.src ?? null,
      primaryColor,
      secondaryColor,
    };
  });

const CFB_WHEEL_SHORT_CODES: Readonly<Record<string, string>> = {
  alabama: "ALA",
  arkansas: "ARK",
  auburn: "AUB",
  florida: "FLA",
  georgia: "UGA",
  kentucky: "UK",
  lsu: "LSU",
  "mississippi-state": "MSST",
  missouri: "MIZ",
  oklahoma: "OU",
  "ole-miss": "MISS",
  "south-carolina": "SC",
  tennessee: "TENN",
  texas: "TEX",
  "texas-am": "TAMU",
  vanderbilt: "VAN",
  illinois: "ILL",
  indiana: "IND",
  iowa: "IOWA",
  maryland: "MD",
  michigan: "MICH",
  "michigan-state": "MSU",
  minnesota: "MINN",
  nebraska: "NEB",
  northwestern: "NU",
  "ohio-state": "OSU",
  oregon: "ORE",
  "penn-state": "PSU",
  purdue: "PUR",
  rutgers: "RUT",
  ucla: "UCLA",
  usc: "USC",
  washington: "WASH",
  wisconsin: "WIS",
  arizona: "ARIZ",
  "arizona-state": "ASU",
  baylor: "BAY",
  byu: "BYU",
  cincinnati: "CIN",
  colorado: "COL",
  houston: "HOU",
  "iowa-state": "ISU",
  kansas: "KU",
  "kansas-state": "KSU",
  "oklahoma-state": "OKST",
  tcu: "TCU",
  "texas-tech": "TTU",
  ucf: "UCF",
  utah: "UTAH",
  "west-virginia": "WVU",
  "boston-college": "BC",
  california: "CAL",
  clemson: "CLEM",
  duke: "DUKE",
  "florida-state": "FSU",
  "georgia-tech": "GT",
  louisville: "LOU",
  miami: "MIA",
  "nc-state": "NCSU",
  "north-carolina": "UNC",
  pittsburgh: "PITT",
  smu: "SMU",
  stanford: "STAN",
  syracuse: "SYR",
  virginia: "UVA",
  "virginia-tech": "VT",
  "wake-forest": "WAKE",
  "notre-dame": "ND",
};

const wheelFootballCfbTeams: readonly WheelFootballTeam[] = CFB_CURRENT_SCHOOLS_2026.map((school) => ({
  code: school.id,
  shortCode: CFB_WHEEL_SHORT_CODES[school.id] ?? school.id.replace(/-/g, "").slice(0, 4).toUpperCase(),
  name: school.school,
  league: "CFB" as const,
  conference: school.conference,
  division: null,
  logoSrc: school.logoUrl,
  primaryColor: school.primaryColor,
  secondaryColor: school.secondaryColor,
  espnId: school.espnId,
}));

export const wheelFootballTeams: readonly WheelFootballTeam[] = [
  ...wheelFootballNflTeams,
  ...wheelFootballCfbTeams,
];

const wheelTeamByCode = new Map(
  wheelFootballTeams.flatMap((team) => [
    [team.code, team] as const,
    [team.code.toUpperCase(), team] as const,
  ]),
);

export function wheelFootballTeam(code: string) {
  return wheelTeamByCode.get(code) ?? wheelTeamByCode.get(code.toUpperCase()) ?? null;
}

export function wheelFootballLeagueFromScope(scope: WheelFootballPoolScope): WheelFootballLeague {
  return ["CFB", "SEC", "BIG_TEN", "BIG_12", "ACC"].includes(scope) ? "CFB" : "NFL";
}

export function wheelFootballPoolLabel(
  scope: WheelFootballPoolScope,
  division: WheelFootballDivision | null = null,
) {
  if (scope === "NFL") return "FULL NFL";
  if (scope === "CFB") return "NATIONAL";
  if (scope === "BIG_TEN") return "BIG TEN";
  if (scope === "BIG_12") return "BIG 12";
  if (scope === "DIVISION") return division ?? "DIVISION";
  return scope;
}

export function wheelFootballPoolTeams(
  scope: WheelFootballPoolScope,
  division: WheelFootballDivision | null = null,
) {
  if (scope === "NFL") return wheelFootballNflTeams;
  if (scope === "AFC" || scope === "NFC") {
    return wheelFootballNflTeams.filter((team) => team.conference === scope);
  }
  if (scope === "DIVISION") {
    if (!division) return [];
    const [conference, divisionName] = division.split(" ") as ["AFC" | "NFC", "East" | "North" | "South" | "West"];
    return wheelFootballNflTeams.filter((team) => (
      team.conference === conference && team.division === divisionName
    ));
  }
  if (scope === "CFB") return wheelFootballCfbTeams;
  const conference = scope === "BIG_TEN"
    ? "Big Ten"
    : scope === "BIG_12"
      ? "Big 12"
      : scope;
  return wheelFootballCfbTeams.filter((team) => team.conference === conference);
}

const POSITION_NAME_ABBREVIATIONS: Readonly<Record<string, string>> = {
  Quarterback: "QB",
  "Running Back": "RB",
  "Wide Receiver": "WR",
  "Tight End": "TE",
  "Defensive End": "DE",
  "Defensive Tackle": "DT",
  "Nose Tackle": "NT",
  Linebacker: "LB",
  "Inside Linebacker": "ILB",
  "Outside Linebacker": "OLB",
  Cornerback: "CB",
  Safety: "S",
  "Free Safety": "FS",
  "Strong Safety": "SS",
  "Defensive Back": "DB",
};

export function wheelFootballEligibleSlots(positionAbbreviation: string): readonly WheelFootballRosterSlot[] {
  const position = positionAbbreviation.trim().toUpperCase();
  if (position === "QB") return ["QB"];
  if (position === "RB") return ["RB", "Flex"];
  if (position === "WR") return ["WR", "Flex"];
  if (position === "TE") return ["Flex"];
  if (["DE", "DT", "NT", "DL", "LB", "ILB", "OLB", "EDGE"].includes(position)) return ["Front Seven"];
  if (["CB", "S", "FS", "SS", "DB"].includes(position)) return ["Secondary"];
  if (position === "HC") return ["Head Coach"];
  return [];
}

export interface WheelFootballCandidate {
  id: string;
  name: string;
  positionLabel: string;
  positionAbbreviation: string;
  headshotUrl: string | null;
  eligibleSlots: readonly WheelFootballRosterSlot[];
  experienceYears: number | null;
  rosterOrder: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function candidatePosition(item: Record<string, unknown>, groupPosition: string | null) {
  const position = asRecord(item.position);
  const abbreviation = text(position?.abbreviation)
    ?? (groupPosition ? POSITION_NAME_ABBREVIATIONS[groupPosition] ?? null : null);
  const label = text(position?.displayName)
    ?? text(position?.name)
    ?? groupPosition
    ?? abbreviation
    ?? "Player";
  return { abbreviation: abbreviation?.toUpperCase() ?? "", label };
}

function candidateHeadshot(item: Record<string, unknown>) {
  return text(asRecord(item.headshot)?.href)
    ?? text(asRecord(item.headshot)?.url)
    ?? null;
}

function candidateExperienceYears(item: Record<string, unknown>) {
  const experience = asRecord(item.experience);
  const rawYears = experience?.years ?? item.experienceYears;
  if (typeof rawYears === "number" && Number.isFinite(rawYears)) return Math.max(0, Math.floor(rawYears));
  if (typeof rawYears === "string" && /^\d+$/.test(rawYears.trim())) return Number(rawYears);
  return null;
}

export function wheelFootballCandidatesFromEspn(payload: unknown): WheelFootballCandidate[] {
  const root = asRecord(payload);
  if (!root) return [];

  const candidates: WheelFootballCandidate[] = [];
  let rosterOrder = 0;
  const athleteGroups = Array.isArray(root.athletes) ? root.athletes : [];
  for (const rawGroup of athleteGroups) {
    const group = asRecord(rawGroup);
    if (!group) continue;
    const groupPosition = text(group.position);
    const items = Array.isArray(group.items) ? group.items : [];
    for (const rawItem of items) {
      const item = asRecord(rawItem);
      if (!item) continue;
      const id = text(item.id);
      const name = text(item.displayName)
        ?? text(item.fullName)
        ?? [text(item.firstName), text(item.lastName)].filter(Boolean).join(" ");
      if (!id || !name) continue;
      const { abbreviation, label } = candidatePosition(item, groupPosition);
      const eligibleSlots = wheelFootballEligibleSlots(abbreviation);
      if (!eligibleSlots.length) continue;
      candidates.push({
        id,
        name,
        positionLabel: label,
        positionAbbreviation: abbreviation,
        headshotUrl: candidateHeadshot(item),
        eligibleSlots,
        experienceYears: candidateExperienceYears(item),
        rosterOrder,
      });
      rosterOrder += 1;
    }
  }

  const coaches = Array.isArray(root.coach)
    ? root.coach
    : Array.isArray(root.coaches)
      ? root.coaches
      : root.coach
        ? [root.coach]
        : root.coaches
          ? [root.coaches]
          : [];
  const headCoach = asRecord(coaches[0]);
  if (headCoach) {
    const id = text(headCoach.id) ?? "head-coach";
    const name = text(headCoach.displayName)
      ?? text(headCoach.fullName)
      ?? [text(headCoach.firstName), text(headCoach.lastName)].filter(Boolean).join(" ");
    if (name) {
      candidates.push({
        id: `coach:${id}`,
        name,
        positionLabel: "Head Coach",
        positionAbbreviation: "HC",
        headshotUrl: null,
        eligibleSlots: ["Head Coach"],
        experienceYears: null,
        rosterOrder,
      });
    }
  }

  const seen = new Set<string>();
  return candidates
    .filter((candidate) => {
      if (seen.has(candidate.id)) return false;
      seen.add(candidate.id);
      return true;
    })
    .sort((left, right) => {
      const leftSlot = WHEEL_FOOTBALL_ROSTER_SLOTS.indexOf(left.eligibleSlots[0]!);
      const rightSlot = WHEEL_FOOTBALL_ROSTER_SLOTS.indexOf(right.eligibleSlots[0]!);
      return leftSlot - rightSlot || left.rosterOrder - right.rosterOrder;
    });
}

const WHEEL_FOOTBALL_SHORTLIST_BASE: Readonly<Record<WheelFootballRosterSlot, number>> = {
  QB: 1,
  RB: 2,
  WR: 3,
  Flex: 4,
  "Front Seven": 5,
  Secondary: 5,
  "Head Coach": 1,
};

const WHEEL_FOOTBALL_SHORTLIST_MAX: Readonly<Record<WheelFootballRosterSlot, number>> =
  WHEEL_FOOTBALL_NFL_PRIORITY_CAPS;

function shouldUseExtraWheelOption(
  slot: WheelFootballRosterSlot,
  base: readonly WheelFootballCandidate[],
  extra: WheelFootballCandidate | undefined,
) {
  if (!extra) return false;
  if (slot === "QB") {
    const starter = base[0];
    return (starter?.experienceYears ?? 99) <= 2 || (extra.experienceYears ?? 99) <= 1;
  }
  if (slot === "RB") return (extra.experienceYears ?? 0) >= 3;
  if (slot === "WR") return (extra.experienceYears ?? 0) >= 2;
  if (slot === "Front Seven" || slot === "Secondary") return (extra.experienceYears ?? 0) >= 2;
  return false;
}

function curatedWheelShortlist(
  candidates: readonly WheelFootballCandidate[],
  slot: WheelFootballRosterSlot,
  teamCode: string,
) {
  const nflPriority = wheelFootballNflPriorityForTeam(teamCode);
  const cfbPriority = wheelFootballCfbPriorityForSchoolId(teamCode);
  const teamPriority = nflPriority ?? cfbPriority;
  if (!teamPriority) return null;
  const namesMatch = nflPriority ? wheelFootballNflNamesMatch : wheelFootballCfbNamesMatch;

  const eligible = candidates.filter((candidate) => candidate.eligibleSlots.includes(slot));
  const selected: WheelFootballCandidate[] = [];
  for (const priorityName of teamPriority[slot]) {
    const match = eligible.find((candidate) => (
      !selected.includes(candidate)
      && namesMatch(candidate.name, priorityName)
    ));
    if (match) selected.push(match);
    if (selected.length >= WHEEL_FOOTBALL_SHORTLIST_MAX[slot]) break;
  }
  return selected;
}

export function wheelFootballShortlist(
  candidates: readonly WheelFootballCandidate[],
  slot: WheelFootballRosterSlot,
  teamCode?: string | null,
) {
  if (teamCode) {
    const curated = curatedWheelShortlist(candidates, slot, teamCode);
    if (curated) return curated;
  }

  const eligible = candidates.filter((candidate) => candidate.eligibleSlots.includes(slot));

  if (slot === "Head Coach") return eligible.slice(0, 1);

  if (slot === "Flex") {
    const selected: WheelFootballCandidate[] = [];
    const take = (position: string, count: number) => {
      for (const candidate of eligible) {
        if (selected.length >= 4 || count <= 0) break;
        if (candidate.positionAbbreviation !== position || selected.includes(candidate)) continue;
        selected.push(candidate);
        count -= 1;
      }
    };
    take("RB", 1);
    take("WR", 2);
    take("TE", 1);
    for (const candidate of eligible) {
      if (selected.length >= 4) break;
      if (!selected.includes(candidate)) selected.push(candidate);
    }
    return selected;
  }

  const baseSize = WHEEL_FOOTBALL_SHORTLIST_BASE[slot];
  const maxSize = WHEEL_FOOTBALL_SHORTLIST_MAX[slot];
  const base = eligible.slice(0, baseSize);
  if (maxSize <= baseSize) return base;

  const extra = eligible[baseSize];
  return shouldUseExtraWheelOption(slot, base, extra)
    ? eligible.slice(0, maxSize)
    : base;
}

function cfbSyntheticCandidate(
  schoolId: string,
  name: string,
  positionAbbreviation: string,
  positionLabel: string,
  rosterOrder: number,
): WheelFootballCandidate {
  return {
    id: `cfb:${schoolId}:${normalizedWheelFootballName(name)}`,
    name,
    positionLabel,
    positionAbbreviation,
    headshotUrl: null,
    eligibleSlots: wheelFootballEligibleSlots(positionAbbreviation),
    experienceYears: null,
    rosterOrder,
  };
}

function normalizedWheelFootballName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function auditedCfbCandidates(
  schoolId: string,
  espnCandidates: readonly WheelFootballCandidate[],
) {
  const priority = wheelFootballCfbPriorityForSchoolId(schoolId);
  if (!priority) return [...espnCandidates];

  const sourceByName = new Map(
    espnCandidates.map((candidate) => [normalizedWheelFootballName(candidate.name), candidate]),
  );
  const selected: WheelFootballCandidate[] = [];
  const seen = new Set<string>();
  let rosterOrder = 0;

  const add = (
    names: readonly string[],
    positionAbbreviation: string,
    positionLabel: string,
  ) => {
    for (const name of names) {
      const key = normalizedWheelFootballName(name);
      if (seen.has(key)) continue;
      seen.add(key);
      const source = sourceByName.get(key);
      selected.push(source
        ? { ...source, rosterOrder: rosterOrder++ }
        : cfbSyntheticCandidate(schoolId, name, positionAbbreviation, positionLabel, rosterOrder++));
    }
  };

  add(priority.QB, "QB", "Quarterback");
  add(priority.RB, "RB", "Running Back");
  add(priority.WR, "WR", "Wide Receiver");
  add(priority.TE, "TE", "Tight End");
  add(priority["Front Seven"], "LB", "Front Seven");
  add(priority.Secondary, "DB", "Secondary");
  add(priority["Head Coach"], "HC", "Head Coach");

  return selected;
}

export async function loadWheelFootballRoster(
  teamCode: string,
  fetcher: typeof fetch = fetch,
) {
  const team = wheelFootballTeam(teamCode);
  if (!team) throw new Error("That Wheel team is unavailable.");

  const isCfb = team.league === "CFB";
  const endpoint = isCfb
    ? `/api/football/cfb-roster?team=${encodeURIComponent(team.espnId ?? "")}`
    : `/api/football/nfl-roster?team=${encodeURIComponent(team.code.toUpperCase())}`;
  const response = await fetcher(endpoint, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(isCfb
      ? "Current college roster could not be loaded."
      : "Current NFL roster could not be loaded.");
  }

  const espnCandidates = wheelFootballCandidatesFromEspn(await response.json());
  const candidates = isCfb
    ? auditedCfbCandidates(team.code, espnCandidates)
    : espnCandidates;
  if (!candidates.length) throw new Error("No eligible current players were returned for that team.");
  return candidates;
}
