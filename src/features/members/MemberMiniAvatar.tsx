import { createContext, useContext, type PropsWithChildren } from "react";
import type { MemberCardSummary } from "./memberProfilesModel";
import { useOptionalProfilePreferences } from "../profile/ProfilePreferencesProvider";
import "../../styles/member-mini-avatar.css";

type AvatarCard = Pick<MemberCardSummary, "displayName" | "initials" | "avatarPhotoData">;
interface AvatarDirectory { byName: ReadonlyMap<string, AvatarCard> }
const AvatarDirectoryContext = createContext<AvatarDirectory | null>(null);
function lookupKey(name: string) { return name.trim().replace(/\s+/g, " ").toUpperCase(); }

/** Reuse existing member cards and the signed-in photo; no extra avatar requests. */
export function MemberAvatarProvider({
  members, currentName, children,
}: PropsWithChildren<{ members: readonly MemberCardSummary[]; currentName: string | null }>) {
  const preferences = useOptionalProfilePreferences();
  const byName = new Map<string, AvatarCard>(members.map(member => [lookupKey(member.displayName), member]));
  if (currentName) {
    const existing = byName.get(lookupKey(currentName));
    byName.set(lookupKey(currentName), {
      displayName: currentName,
      initials: existing?.initials ?? currentName.trim().slice(0, 2),
      avatarPhotoData: preferences?.avatarPhotoData ?? existing?.avatarPhotoData ?? null,
    });
  }
  return <AvatarDirectoryContext.Provider value={{ byName }}>{children}</AvatarDirectoryContext.Provider>;
}

export function MemberMiniAvatar({
  displayName, avatarPhotoData, initials, small = false,
}: { displayName: string; avatarPhotoData?: string | null; initials?: string; small?: boolean }) {
  const directory = useContext(AvatarDirectoryContext);
  const card = directory?.byName.get(lookupKey(displayName));
  const photo = avatarPhotoData ?? card?.avatarPhotoData ?? null;
  const fallback = (initials ?? card?.initials ?? displayName.trim().slice(0, 2).toUpperCase()) || "HQ";
  return (
    <span className={`member-mini-avatar${small ? " member-mini-avatar--small" : ""}`} aria-hidden="true">
      {photo ? <img src={photo} alt="" /> : fallback}
    </span>
  );
}
