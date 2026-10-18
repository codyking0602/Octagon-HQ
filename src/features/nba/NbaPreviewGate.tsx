import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { canPreviewNba } from "./nbaPreviewAccess";

export function NbaPreviewGate({ children }: PropsWithChildren) {
  const identity = useIdentity();
  if (!identity.ready) return null;
  if (!canPreviewNba(identity.profile)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
