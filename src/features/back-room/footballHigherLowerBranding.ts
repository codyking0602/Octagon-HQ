import {
  footballCfbTeamMediaId,
  footballNflTeamMediaId,
} from "./footballMediaIdentity";
import { getFootballSubject } from "./footballFactualStats";
import { footballTeamAssets } from "./footballSubjectAssets";
import {
  footballTeamSchoolMetadataFor,
  type FootballTeamSchoolMetadata,
} from "./footballTeamSchoolMetadata";
import {
  wheelFootballTeam,
  wheelFootballTeams,
  type WheelFootballTeam,
} from "./wheelFootballModel";

export interface FootballHigherLowerBrand {
  name: string;
  logoSrc: string | null;
  primaryColor: string;
  secondaryColor: string;
}

const COLOR_HEX: Readonly<Record<string, string>> = {
  black: "#101820",
  blue: "#1D4E89",
  brown: "#4E2A14",
  cardinal: "#9B1C31",
  cream: "#F3E8C8",
  crimson: "#9E1B32",
  garnet: "#782F40",
  gold: "#C9A227",
  gray: "#A7A9AC",
  green: "#1F6A44",
  maize: "#FFCB05",
  maroon: "#7A1E2C",
  navy: "#0B1F3A",
  orange: "#F26A21",
  purple: "#5A2D82",
  red: "#C61F3A",
  scarlet: "#BB0000",
  silver: "#A7AFB7",
  white: "#F4F7F9",
  yellow: "#F5C518",
};

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function wheelBrand(team: WheelFootballTeam): FootballHigherLowerBrand {
  return {
    name: team.name,
    logoSrc: team.logoSrc,
    primaryColor: team.primaryColor,
    secondaryColor: team.secondaryColor,
  };
}

function wheelTeamForName(value: string) {
  const metadata = footballTeamSchoolMetadataFor(value);
  const aliases = [
    value,
    metadata?.name,
    ...(metadata?.aliases ?? []),
  ].filter((candidate): candidate is string => Boolean(candidate));
  const normalizedAliases = new Set(aliases.map(normalize));
  return wheelFootballTeams.find((team) => (
    normalizedAliases.has(normalize(team.name))
    || normalizedAliases.has(normalize(team.code))
    || normalizedAliases.has(normalize(team.shortCode))
  )) ?? null;
}

function metadataBrand(metadata: FootballTeamSchoolMetadata): FootballHigherLowerBrand {
  const primaryColor = COLOR_HEX[metadata.colors[0]?.toLowerCase() ?? ""] ?? "#174A7E";
  const secondaryColor = COLOR_HEX[metadata.colors[1]?.toLowerCase() ?? ""] ?? "#8FC8F4";
  const mediaId = metadata.level === "NFL"
    ? footballNflTeamMediaId(
        metadata.aliases?.find((alias) => /^[A-Z]{2,3}$/.test(alias)) ?? metadata.name,
      )
    : footballCfbTeamMediaId(metadata.name);

  return {
    name: metadata.name,
    logoSrc: footballTeamAssets[mediaId]?.src ?? null,
    primaryColor,
    secondaryColor,
  };
}

function brandForTeamValue(value: string) {
  const wheelTeam = wheelTeamForName(value);
  if (wheelTeam) return wheelBrand(wheelTeam);
  const metadata = footballTeamSchoolMetadataFor(value);
  return metadata ? metadataBrand(metadata) : null;
}

function brandForTeamId(teamId: string) {
  const [league, ...rest] = teamId.split(":");
  const raw = rest.join(":");
  if (!raw) return null;
  const wheelTeam = league === "nfl"
    ? wheelFootballTeam(raw.toUpperCase())
    : wheelFootballTeam(raw.toLowerCase());
  if (wheelTeam) return wheelBrand(wheelTeam);
  return brandForTeamValue(raw.replace(/-/g, " "));
}

export function footballHigherLowerBrandForSubject(subjectId: string): FootballHigherLowerBrand | null {
  const subject = getFootballSubject(subjectId);
  if (!subject) return null;

  if (subject.teamId) {
    const brand = brandForTeamId(subject.teamId);
    if (brand) return brand;
  }

  if (subject.league === "CFB" && subject.school) {
    const brand = brandForTeamValue(subject.school);
    if (brand) return brand;
  }

  if (subject.league === "NFL") {
    for (const franchise of subject.franchises ?? []) {
      const brand = brandForTeamValue(franchise);
      if (brand) return brand;
    }
  }

  if (subject.kind === "team-season") {
    const withoutYear = subject.name.replace(/^\d{4}\s+/, "");
    return brandForTeamValue(withoutYear);
  }

  return null;
}
