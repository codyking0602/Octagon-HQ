import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";

export function canAccessNbaWhoAmIPreview(
  profile: { canControlPicks?: boolean; displayName: string } | null | undefined,
) {
  return profile?.canControlPicks === true && profile.displayName.trim().toUpperCase() === "CODY";
}

export function NbaWhoAmIPreviewGate({ children }: PropsWithChildren) {
  const identity = useIdentity();
  if (!identity.ready) return null;
  return canAccessNbaWhoAmIPreview(identity.profile)
    ? <>{children}</>
    : <Navigate to="/nba" replace />;
}
