import { useOptionalPlayChallenges } from "../challenges/ChallengeProvider";
import { useOptionalProfilePreferences } from "../profile/ProfilePreferencesProvider";
import "../../styles/member-inline-avatar.css";

/** Shared compact member identity mark; no duplicate photo system. */
export function InlineAvatar({ displayName, photo, initials, className = "" }: {
  displayName: string; photo?: string | null; initials?: string | null; className?: string;
}) {
  const fallback = initials || displayName.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase() || "HQ";
  return <span className={["member-inline-avatar", className].filter(Boolean).join(" ")} aria-hidden="true">
    {photo ? <img src={photo} alt="" /> : fallback}
  </span>;
}

/** Reuses the cached member directory and current signed-in photo preferences. */
export function MemberInlineAvatar({ displayName, profileId, isCurrentUser = false, className = "" }: {
  displayName: string; profileId?: string | null; isCurrentUser?: boolean; className?: string;
}) {
  const challenges = useOptionalPlayChallenges();
  const preferences = useOptionalProfilePreferences();
  const normalize = (name: string) => name.trim().replace(/\s+/g, " ").toUpperCase();
  const own = isCurrentUser || Boolean(challenges?.activeProfile && (
    (profileId && profileId === challenges.activeProfile.id)
    || normalize(displayName) === normalize(challenges.activeProfile.displayName)
  ));
  const member = challenges?.members.find(candidate => normalize(candidate.displayName) === normalize(displayName));
  const photo = (own ? preferences?.avatarPhotoData : member?.avatarPhotoData) ?? null;
  const initials = own ? challenges?.activeProfile?.initials : member?.initials;
  return <InlineAvatar displayName={displayName} photo={photo} initials={initials} className={className} />;
}
