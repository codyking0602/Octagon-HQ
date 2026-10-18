import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { IdentityProfile } from "../identity/identityModel";

/** Games remain owner-preview-only until the post-World-Series launch. */
export function canPreviewNbaWhoAmI(profile: Pick<IdentityProfile, "displayName" | "canControlPicks"> | null | undefined) {
  return profile?.canControlPicks === true && profile.displayName.trim().toUpperCase() === "CODY";
}

export function NbaWhoAmIOwnerGate({ children }: PropsWithChildren) {
  const identity = useIdentity();
  if (!identity.ready) return null;
  return canPreviewNbaWhoAmI(identity.profile) ? <>{children}</> : <Navigate to="/nba" replace />;
}
