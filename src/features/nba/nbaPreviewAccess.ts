import type { IdentityProfile } from "../identity/identityModel";

// Basketball is owner-preview-only until the public release is approved.
export const NBA_PUBLIC_ENABLED = false;
export const NBA_POSTER_SRC = "/assets/nba/basketball-welcome.png";

export function canPreviewNba(profile: Pick<IdentityProfile, "displayName" | "canControlPicks"> | null | undefined) {
  return NBA_PUBLIC_ENABLED || Boolean(
    profile?.canControlPicks === true && profile.displayName.trim().toUpperCase() === "CODY"
  );
}
