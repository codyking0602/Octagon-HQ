import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { IdentityProfile } from "../identity/identityModel";
import {
  nbaCanAccessPublicCasual, nbaCentralDay,
} from "./nbaDailySchedule";

type GateProfile = Pick<IdentityProfile, "displayName" | "canControlPicks"> | null | undefined;

/** A separate owner namespace remains exclusively for historical QA. */
export function canPreviewNbaWhoAmI(profile: GateProfile) {
  return profile?.canControlPicks === true && profile.displayName.trim().toUpperCase() === "CODY";
}
export function canAccessNbaGames(profile: GateProfile, _centralDay: string) {
  return canPreviewNbaWhoAmI(profile);
}

/** Four casual modes open publicly on launch day without prematurely opening official Daily. */
const casualPaths = new Set<string>([
  "/nba/who-am-i", "/nba/find-the-leader", "/nba/hit-the-number", "/nba/higher-lower",
]);
export function canAccessNbaCasualRoute(pathname: string, search: string, day: string) {
  if (!nbaCanAccessPublicCasual(day) || !casualPaths.has(pathname)) return false;
  return new URLSearchParams(search).get("mode") !== "daily";
}

export function NbaWhoAmIOwnerGate({ children }: PropsWithChildren) {
  const identity = useIdentity();
  const location = useLocation();
  if (!identity.ready) return null;
  const day = nbaCentralDay();
  return canAccessNbaGames(identity.profile, day) ||
    canAccessNbaCasualRoute(location.pathname, location.search, day)
    ? <>{children}</>
    : <Navigate to="/nba" replace />;
}
