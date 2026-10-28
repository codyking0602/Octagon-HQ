import type { CSSProperties } from "react";
import { CFB_BUILD_QB_SCHOOL_COLORS } from "./cfbBuildQbVisualIdentity";
import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";

const EXTRA_COLORS: Readonly<Record<string, readonly [string, string]>> = {
  "South Carolina": ["#73000A", "#000000"],
};

function rgbChannels(hex: string) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

function schoolCode(school: string) {
  const words = school.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase();
}

export interface FootballWeeklySuperteamIdentity {
  school: string;
  code: string;
  primary: string;
  primaryRgb: string;
  secondary: string;
  logoSrc: string | null;
}

export function footballWeeklySuperteamIdentity(school: string): FootballWeeklySuperteamIdentity {
  const colors = CFB_BUILD_QB_SCHOOL_COLORS[school] ?? EXTRA_COLORS[school] ?? ["#17324D", "#FFFFFF"];
  const asset = footballTeamAssets[footballCfbTeamMediaId(school)];
  return {
    school,
    code: schoolCode(school),
    primary: colors[0],
    primaryRgb: rgbChannels(colors[0]),
    secondary: colors[1],
    logoSrc: asset?.src ?? null,
  };
}

export function footballWeeklySuperteamStyle(identity: FootballWeeklySuperteamIdentity): CSSProperties {
  return {
    "--superteam-primary": identity.primary,
    "--superteam-primary-rgb": identity.primaryRgb,
    "--superteam-secondary": identity.secondary,
  } as CSSProperties;
}


/**
 * Sports-Reference CFB player handles include non-semantic numeric suffixes that cannot
 * be derived safely from a player's name. Use Sports-Reference's own resolver rather
 * than guessing a direct player slug and risking the wrong athlete.
 */
export function footballWeeklySuperteamSportsReferenceUrl(displayName: string) {
  return `https://www.sports-reference.com/cfb/search/search.fcgi?search=${encodeURIComponent(displayName)}`;
}
