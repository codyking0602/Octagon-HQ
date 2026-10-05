import type { IdentityProfile } from "../identity/identityModel";

const WHEEL_FOOTBALL_GM_PLAYTEST_NAMES = new Set(["CODY", "TEST"]);

export function isWheelFootballGmPlaytester(profile: IdentityProfile | null) {
  return Boolean(
    profile?.canControlPicks
    && WHEEL_FOOTBALL_GM_PLAYTEST_NAMES.has(profile.displayName.trim().toUpperCase()),
  );
}
