import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { canViewMlbPlayoffs } from "./mlbPlayoffsConfig";

export function MlbGate({ children, fallback = "/" }: PropsWithChildren<{ fallback?: string }>) {
  const identity = useIdentity();
  if (!identity.ready) return null;
  return canViewMlbPlayoffs(identity.profile) ? <>{children}</> : <Navigate to={fallback} replace />;
}
