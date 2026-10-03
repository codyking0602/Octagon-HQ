import {
  footballNflTeamMediaCode,
  footballNflTeamMediaId,
} from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";
import { footballTeamSchoolMetadata } from "./footballTeamSchoolMetadata";

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
export type WheelFootballPoolScope = "NFL" | "AFC" | "NFC" | "DIVISION";

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
  name: string;
  conference: "AFC" | "NFC";
  division: "East" | "North" | "South" | "West";
  logoSrc: string | null;
  primaryColor: string;
  secondaryColor: string;
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

export const wheelFootballTeams: readonly WheelFootballTeam[] = footballTeamSchoolMetadata
  .filter((row) => row.level === "NFL" && row.nflConference && row.nflDivision)
  .map((row) => {
    const code = nflTeamCode(row);
    const [primaryColor, secondaryColor] = NFL_WHEEL_COLORS[code] ?? ["#174A7E", "#8FC8F4"];
    return {
      code,
      name: row.name,
      conference: row.nflConference!,
      division: row.nflDivision!,
      logoSrc: footballTeamAssets[footballNflTeamMediaId(code)]?.src ?? null,
      primaryColor,
      secondaryColor,
    };
  });

const wheelTeamByCode = new Map(wheelFootballTeams.map((team) => [team.code, team]));

export function wheelFootballTeam(code: string) {
  return wheelTeamByCode.get(code.toUpperCase()) ?? null;
}

export function wheelFootballPoolTeams(
  scope: WheelFootballPoolScope,
  division: WheelFootballDivision | null = null,
) {
  if (scope === "NFL") return wheelFootballTeams;
  if (scope === "AFC" || scope === "NFC") {
    return wheelFootballTeams.filter((team) => team.conference === scope);
  }
  if (!division) return [];
  const [conference, divisionName] = division.split(" ") as ["AFC" | "NFC", WheelFootballTeam["division"]];
  return wheelFootballTeams.filter((team) => (
    team.conference === conference && team.division === divisionName
  ));
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
  depthRank?: number | null;
  depthPositionIndex?: number | null;
  isInjured?: boolean;
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

function normalizedPlayerName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

type WheelDepthPlacement = { rank: number; positionIndex: number };

function depthPlacementIsBetter(next: WheelDepthPlacement, current: WheelDepthPlacement | undefined) {
  return !current
    || next.rank < current.rank
    || (next.rank === current.rank && next.positionIndex < current.positionIndex);
}

function wheelDepthPlacements(payload: unknown) {
  const root = asRecord(payload);
  const byId = new Map<string, WheelDepthPlacement>();
  const byName = new Map<string, WheelDepthPlacement>();
  if (!root) return { byId, byName };

  const positionGroups: Record<string, unknown>[] = [];
  if (Array.isArray(root.positions)) {
    positionGroups.push(...root.positions.flatMap((entry) => asRecord(entry) ?? []));
  } else {
    const rootPositions = asRecord(root.positions);
    if (rootPositions) {
      for (const value of Object.values(rootPositions)) {
        const position = asRecord(value);
        if (position) positionGroups.push(position);
      }
    }
  }
  if (Array.isArray(root.depthCharts)) {
    for (const rawChart of root.depthCharts) {
      const chart = asRecord(rawChart);
      const positions = asRecord(chart?.positions);
      if (!positions) continue;
      for (const value of Object.values(positions)) {
        const position = asRecord(value);
        if (position) positionGroups.push(position);
      }
    }
  }

  positionGroups.forEach((group, positionIndex) => {
    const athletes = Array.isArray(group.athletes) ? group.athletes : [];
    for (const rawEntry of athletes) {
      const entry = asRecord(rawEntry);
      const athlete = asRecord(entry?.athlete);
      if (!entry || !athlete) continue;
      const rawRank = entry.rank;
      const rank = typeof rawRank === "number"
        ? rawRank
        : typeof rawRank === "string" && /^\d+$/.test(rawRank.trim())
          ? Number(rawRank)
          : null;
      if (rank == null || rank < 1) continue;
      const placement = { rank, positionIndex };
      const id = text(athlete.id);
      const name = text(athlete.displayName) ?? text(athlete.fullName);
      if (id && depthPlacementIsBetter(placement, byId.get(id))) byId.set(id, placement);
      if (name) {
        const key = normalizedPlayerName(name);
        if (depthPlacementIsBetter(placement, byName.get(key))) byName.set(key, placement);
      }
    }
  });

  return { byId, byName };
}

function wheelInjuryIdentity(payload: unknown) {
  const root = asRecord(payload);
  const ids = new Set<string>();
  const names = new Set<string>();
  if (!root) return { ids, names };
  const rows = Array.isArray(root.injuries)
    ? root.injuries
    : Array.isArray(root.items)
      ? root.items
      : [];
  for (const rawRow of rows) {
    const row = asRecord(rawRow);
    const athlete = asRecord(row?.athlete);
    if (!athlete) continue;
    const id = text(athlete.id);
    const name = text(athlete.displayName) ?? text(athlete.fullName);
    if (id) ids.add(id);
    if (name) names.add(normalizedPlayerName(name));
  }
  return { ids, names };
}

export function wheelFootballCandidatesFromEspn(payload: unknown): WheelFootballCandidate[] {
  const envelope = asRecord(payload);
  if (!envelope) return [];
  const root = asRecord(envelope.roster) ?? envelope;
  const depth = wheelDepthPlacements(envelope.depthChart);
  const injured = wheelInjuryIdentity(envelope.injuries);

  const candidates: WheelFootballCandidate[] = [];
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
      const depthPlacement = depth.byId.get(id) ?? depth.byName.get(normalizedPlayerName(name));
      candidates.push({
        id,
        name,
        positionLabel: label,
        positionAbbreviation: abbreviation,
        headshotUrl: candidateHeadshot(item),
        eligibleSlots,
        experienceYears: candidateExperienceYears(item),
        depthRank: depthPlacement?.rank ?? null,
        depthPositionIndex: depthPlacement?.positionIndex ?? null,
        isInjured: injured.ids.has(id) || injured.names.has(normalizedPlayerName(name)),
      });
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
        depthRank: null,
        depthPositionIndex: null,
        isInjured: false,
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
      return leftSlot - rightSlot;
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

const WHEEL_FOOTBALL_SHORTLIST_MAX: Readonly<Record<WheelFootballRosterSlot, number>> = {
  QB: 2,
  RB: 3,
  WR: 4,
  Flex: 4,
  "Front Seven": 6,
  Secondary: 6,
  "Head Coach": 1,
};

function wheelCandidatePriority(
  candidate: WheelFootballCandidate,
  slot: WheelFootballRosterSlot,
) {
  const rank = candidate.depthRank ?? 99;
  const positionIndex = candidate.depthPositionIndex ?? 99;
  const injuryProtection = candidate.isInjured && (candidate.experienceYears ?? 0) >= 3;
  if (rank === 1) return [0, positionIndex] as const;
  if (injuryProtection) return [1, positionIndex] as const;
  if (rank < 99) return [rank + 1, positionIndex] as const;
  if (slot === "Head Coach") return [0, positionIndex] as const;
  return [100, positionIndex] as const;
}

function wheelCandidatesForSlot(
  candidates: readonly WheelFootballCandidate[],
  slot: WheelFootballRosterSlot,
) {
  return candidates
    .filter((candidate) => candidate.eligibleSlots.includes(slot))
    .map((candidate, sourceIndex) => ({ candidate, sourceIndex }))
    .sort((left, right) => {
      const [leftPriority, leftPosition] = wheelCandidatePriority(left.candidate, slot);
      const [rightPriority, rightPosition] = wheelCandidatePriority(right.candidate, slot);
      return leftPriority - rightPriority
        || leftPosition - rightPosition
        || left.sourceIndex - right.sourceIndex;
    })
    .map(({ candidate }) => candidate);
}

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

export function wheelFootballShortlist(
  candidates: readonly WheelFootballCandidate[],
  slot: WheelFootballRosterSlot,
) {
  const eligible = wheelCandidatesForSlot(candidates, slot);

  if (slot === "QB") {
    const top = eligible[0];
    if (!top) return [];
    const injuryProtected = eligible.find((candidate, index) => (
      index > 0
      && candidate.isInjured
      && (candidate.experienceYears ?? 0) >= 3
    ));
    if (injuryProtected) return [top, injuryProtected].slice(0, WHEEL_FOOTBALL_SHORTLIST_MAX.QB);
  }

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

export async function loadWheelFootballRoster(
  teamCode: string,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(
    `/api/football/nfl-roster?team=${encodeURIComponent(teamCode.toUpperCase())}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error("Current NFL roster could not be loaded.");
  const candidates = wheelFootballCandidatesFromEspn(await response.json());
  if (!candidates.length) throw new Error("No eligible current players were returned for that team.");
  return candidates;
}
