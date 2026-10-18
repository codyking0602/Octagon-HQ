import type { IdentityProfile } from "../identity/identityModel";

// Basketball public launch, Oct 2026.
export const NBA_PUBLIC_ENABLED = true;
export const NBA_POSTER_SRC = "/assets/nba/basketball-welcome.png";

export function canPreviewNba(profile: Pick<IdentityProfile, "displayName" | "canControlPicks"> | null | undefined) {
  return NBA_PUBLIC_ENABLED || Boolean(
    profile?.canControlPicks === true && profile.displayName.trim().toUpperCase() === "CODY"
  );
}
