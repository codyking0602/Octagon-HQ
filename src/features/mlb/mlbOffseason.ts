import type { IdentityProfile } from "../identity/identityModel";

/** The temporary season-closeout announcement is only for Cody and Shane.
 * This is presentation gating, not a backend permission or new privacy boundary. */
// Original production rollout: October 29 at approximately 06:30 Central.
// Global 24-hour expiry, independent of visits or local storage.
export const MLB_CLOSEOUT_BANNER_EXPIRES_AT = Date.parse("2026-10-30T11:30:00Z");

export function canViewMlbCloseoutBanner(profile: Pick<IdentityProfile, "displayName"> | null | undefined, now = Date.now()): boolean {
  const name = profile?.displayName.trim().toUpperCase();
  return now < MLB_CLOSEOUT_BANNER_EXPIRES_AT && (name === "CODY" || name === "CODY KING" || name === "SHANE" || name === "SHANE KING");
}
