import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { IdentityProfile } from "../identity/identityModel";
import { nbaCanAccessReleasedGames, nbaCentralDay } from "./nbaDailySchedule";

type GateProfile = Pick<IdentityProfile, "displayName" | "canControlPicks"> | null | undefined;

/** All NBA games remain private during owner testing. Futures are a separate public product. */
export function canPreviewNbaWhoAmI(profile: GateProfile) {
  return profile?.canControlPicks === true && profile.displayName.trim().toUpperCase() === "CODY";
}

/**
 * Reuse the same gate for all nine game routes. The November 1 date alone
 * cannot open local-preview gameplay: the official-backend readiness flag
 * remains mandatory before access expands to the public.
 */
export function canAccessNbaGames(profile: GateProfile, centralDay: string) {
  return canPreviewNbaWhoAmI(profile) || nbaCanAccessReleasedGames(centralDay);
}

export function NbaWhoAmIOwnerGate({ children }: PropsWithChildren) {
  const identity = useIdentity();
  if (!identity.ready) return null;
  return canAccessNbaGames(identity.profile, nbaCentralDay())
    ? <>{children}</>
    : <Navigate to="/nba" replace />;
}
