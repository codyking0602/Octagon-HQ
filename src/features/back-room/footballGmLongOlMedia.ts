import { useEffect, useState } from "react";

/**
 * Long GM's OL authority does not contain ESPN identities or dates of birth.
 * Use the EXISTING same-origin, allowlisted NFL roster proxy to resolve both
 * at runtime. Short GM's player population and headshot behavior are untouched.
 * A name must match exactly within that NFL team; never guess an ESPN ID,
 * portrait, or age from a similar-looking athlete.
 */
export interface NflGmLongOlBio {
  age: number | null;
  headshotUrl: string | null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

export function nflGmLongOlNameKey(name: string): string {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
}

function rosterAge(raw: Record<string, unknown>, today: Date): number | null {
  const age = typeof raw.age === "number" ? raw.age
    : typeof raw.age === "string" && /^\d{1,2}$/.test(raw.age) ? Number(raw.age) : null;
  if (age != null && Number.isInteger(age) && age >= 19 && age <= 45) return age;
  const date = typeof raw.dateOfBirth === "string" ? raw.dateOfBirth : "";
  const parts = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(date);
  if (!parts) return null;
  const bornYear = Number(parts[1]), month = Number(parts[2]), day = Number(parts[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const year = today.getUTCFullYear();
  const birthdayPassed = today.getUTCMonth() + 1 > month
    || (today.getUTCMonth() + 1 === month && today.getUTCDate() >= day);
  const result = year - bornYear - (birthdayPassed ? 0 : 1);
  return result >= 19 && result <= 45 ? result : null;
}

function photoUrl(raw: Record<string, unknown>): string | null {
  const headshot = record(raw.headshot);
  const href = headshot?.href ?? headshot?.url;
  if (typeof href !== "string") return null;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && (url.hostname === "a.espncdn.com" || url.hostname === "a.espn.com")
      ? href : null;
  } catch {
    return null;
  }
}

export function nflGmLongOlBiosFromEspn(
  payload: unknown,
  today: Date = new Date(),
): ReadonlyMap<string, NflGmLongOlBio> {
  const root = record(payload);
  const groups = Array.isArray(root?.athletes) ? root.athletes : [];
  const bios = new Map<string, NflGmLongOlBio>();
  const ambiguous = new Set<string>();
  for (const rawGroup of groups) {
    const group = record(rawGroup);
    const items = Array.isArray(group?.items) ? group.items : [];
    for (const rawItem of items) {
      const athlete = record(rawItem);
      if (!athlete) continue;
      const position = record(athlete.position);
      const role = typeof position?.abbreviation === "string" ? position.abbreviation.toUpperCase() : "";
      // Never match a non-OL player with a coincidentally identical name.
      if (!["T", "OT", "LT", "RT", "G", "OG", "LG", "RG", "C", "OL"].includes(role)) continue;
      const name = [athlete.displayName, athlete.fullName].find(v => typeof v === "string" && v.trim());
      if (typeof name !== "string") continue;
      const key = nflGmLongOlNameKey(name);
      if (!key) continue;
      if (bios.has(key)) {
        bios.delete(key);
        ambiguous.add(key);
      }
      if (!ambiguous.has(key)) {
        bios.set(key, { age: rosterAge(athlete, today), headshotUrl: photoUrl(athlete) });
      }
    }
  }
  return bios;
}

// Cache one roster request per TEAM rather than per player/card. Never cache a
// failed request as a permanent negative: retry when the player is shown again.
const rosterLoads = new Map<string, Promise<ReadonlyMap<string, NflGmLongOlBio>>>();

function loadTeamOlBios(team: string) {
  const existing = rosterLoads.get(team);
  if (existing) return existing;
  const request = fetch(`/api/football/nfl-roster?team=${encodeURIComponent(team)}`)
    .then(async response => {
      if (!response.ok) throw new Error("NFL roster temporarily unavailable");
      return nflGmLongOlBiosFromEspn(await response.json());
    }).catch(() => {
      rosterLoads.delete(team);
      return new Map<string, NflGmLongOlBio>();
    });
  rosterLoads.set(team, request);
  return request;
}

export function useNflGmLongOlBio(team: string, name: string, isOffensiveLineman: boolean) {
  const key = `${team}:${nflGmLongOlNameKey(name)}`;
  const [state, setState] = useState<{ key: string; bio: NflGmLongOlBio | null }>({ key, bio: null });
  useEffect(() => {
    if (!isOffensiveLineman) return;
    let active = true;
    void loadTeamOlBios(team).then(rows => {
      if (active) setState({ key, bio: rows.get(nflGmLongOlNameKey(name)) ?? null });
    });
    return () => { active = false; };
  }, [team, name, key, isOffensiveLineman]);
  return state.key === key ? state.bio : null;
}
