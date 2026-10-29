import type {PropsWithChildren} from "react";
import {Navigate} from "react-router-dom";
import {useIdentity} from "../identity/IdentityProvider";
import {canPreviewNbaWhoAmI} from "./NbaWhoAmIOwnerGate";
/** Do not reuse the NBA games gate: that opens to the public November 1. */
export function NbaCupOwnerGate({children}:PropsWithChildren){
  const identity=useIdentity();
  if(!identity.ready)return null;
  return canPreviewNbaWhoAmI(identity.profile)?<>{children}</>:<Navigate to="/nba/picks" replace/>;
}