import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIdentity } from "./IdentityProvider";

export function OwnerOnlyRoute({
  children,
  fallback,
}: PropsWithChildren<{ fallback: string }>) {
  const identity = useIdentity();

  if (!identity.ready) return null;

  return identity.profile?.canControlPicks === true
    ? <>{children}</>
    : <Navigate to={fallback} replace />;
}
