import type { IdentityProfile } from "../identity/identityModel";

export function isFamilyFeudPrototypeOwner(profile: IdentityProfile | null) {
  return Boolean(
    profile?.canControlPicks
    && profile.displayName.trim().toUpperCase() === "CODY"
  );
}
