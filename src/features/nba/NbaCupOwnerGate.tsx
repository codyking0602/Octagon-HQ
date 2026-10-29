import type {PropsWithChildren} from "react";
import {Navigate} from "react-router-dom";
import {useIdentity} from "../identity/IdentityProvider";
import {canPreviewNba} from "./nbaPreviewAccess";
/** Legacy /nba/cup deep link follows the same public NBA access as /nba/picks. */
export function NbaCupOwnerGate({children}:PropsWithChildren){
  const identity=useIdentity();
  if(!identity.ready)return null;
  return canPreviewNba(identity.profile)?<>{children}</>:<Navigate to="/nba/picks" replace/>;
}
