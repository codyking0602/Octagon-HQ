import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { isWheelFootballGmPlaytester } from "./wheelFootballGmAccess";

export function WheelFootballGmPlaytestRoute({
  children,
  fallback,
}: PropsWithChildren<{ fallback: string }>) {
  const identity = useIdentity();

  if (!identity.ready) return null;

  return isWheelFootballGmPlaytester(identity.profile)
    ? <>{children}</>
    : <Navigate to={fallback} replace />;
}
