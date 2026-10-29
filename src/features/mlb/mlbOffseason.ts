import type { IdentityProfile } from "../identity/identityModel";

/** The temporary season-closeout announcement is only for Cody and Shane.
 * This is presentation gating, not a backend permission or new privacy boundary. */
export function canViewMlbCloseoutBanner(profile: Pick<IdentityProfile, "displayName"> | null | undefined): boolean {
  const name = profile?.displayName.trim().toUpperCase();
  return name === "CODY" || name === "CODY KING" || name === "SHANE" || name === "SHANE KING";
}
