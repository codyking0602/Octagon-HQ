import type { IdentityProfile } from "../identity/identityModel";

export function isFootballWeeklyBuildQbPreviewOwner(profile: IdentityProfile | null) {
  return Boolean(
    profile?.canControlPicks
    && profile.displayName.trim().toUpperCase() === "CODY"
  );
}
