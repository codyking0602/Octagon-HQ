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
