import type { IdentityProfile } from "../identity/identityModel";

export function isFootballWeeklyAuctionFinalPreviewOwner(profile: IdentityProfile | null) {
  return Boolean(
    profile?.canControlPicks
    && profile.displayName.trim().toUpperCase() === "CODY"
  );
}
