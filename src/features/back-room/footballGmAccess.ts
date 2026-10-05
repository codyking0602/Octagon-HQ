import type { IdentityProfile } from "../identity/identityModel";

const GM_PLAYTEST_NAMES = new Set(["CODY", "TEST"]);

export function isFootballGmPlaytestProfile(profile: IdentityProfile | null) {
  const name = profile?.displayName.trim().toUpperCase() ?? "";
  return Boolean(profile?.canControlPicks && GM_PLAYTEST_NAMES.has(name));
}

export function footballGmPlaytestOpponentName(profile: IdentityProfile | null) {
  const name = profile?.displayName.trim().toUpperCase() ?? "";
  if (name === "CODY") return "TEST";
  if (name === "TEST") return "CODY";
  return null;
}
