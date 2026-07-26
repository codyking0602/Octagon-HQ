import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { allTime } from "../rankings/rankingModel";
import { memberProfilePath, type MemberCardSummary } from "./memberProfilesModel";
import {
  createMemberProfilesRepository,
  type MemberProfilesRepository,
} from "./memberProfilesRepository";

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not load member profiles.";
}

export function MemberDirectoryView({
  repository: suppliedRepository,
}: {
  repository?: MemberProfilesRepository | null;
}) {
  const identity = useIdentity();
  const [repository] = useState<MemberProfilesRepository | null>(() => (
    suppliedRepository === undefined ? createMemberProfilesRepository() : suppliedRepository
  ));
  const [members, setMembers] = useState<MemberCardSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const revisionRef = useRef(0);

  useEffect(() => {
    const revision = ++revisionRef.current;
    if (!identity.profile) {
      setMembers([]);
      setLoading(false);
      setError("");
      return;
    }
    if (!repository) {
      setMembers([]);
      setLoading(false);
      setError("Member Profiles are not connected on this build.");
      return;
    }

    setLoading(true);
    void repository.listMembers()
      .then((nextMembers) => {
        if (revision !== revisionRef.current) return;
        setMembers(nextMembers);
        setError("");
      })
      .catch((nextError) => {
        if (revision !== revisionRef.current) return;
        setMembers([]);
        setError(readableError(nextError));
      })
      .finally(() => {
        if (revision === revisionRef.current) setLoading(false);
      });
  }, [identity.profile?.id, repository]);

  return (
    <div className="page member-directory-page">
      <section className="page-heading member-page-heading">
        <p className="eyebrow">OCTAGON HQ MEMBERS</p>
        <h1>Member Profiles</h1>
        <p>See who is in HQ, what they are tracking, and who is ready for the next UFC challenge.</p>
      </section>

      {!identity.profile ? (
        <section className="surface-card member-state-card">
          <div className="member-initials" aria-hidden="true">HQ</div>
          <div>
            <p className="eyebrow">MEMBERS ONLY</p>
            <h2>Sign in to view the member directory</h2>
            <p>Registered profile names, favorite fighters, streaks, and Picks records stay inside Octagon HQ.</p>
          </div>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO VIEW MEMBERS</button>
        </section>
      ) : loading ? (
        <section className="surface-card member-state-card" aria-live="polite">
          <div className="member-initials" aria-hidden="true">HQ</div>
          <div><p className="eyebrow">SYNCING</p><h2>Loading members…</h2></div>
        </section>
      ) : error ? (
        <section className="surface-card member-state-card" role="status">
          <div className="member-initials" aria-hidden="true">!</div>
          <div><p className="eyebrow">UNAVAILABLE</p><h2>Member Profiles could not load</h2><p>{error}</p></div>
        </section>
      ) : members.length ? (
        <section className="member-directory-grid" aria-label="Octagon HQ member directory">
          {members.map((member) => {
            const favorite = member.favoriteFighterSlug
              ? allTime.find((fighter) => fighter.slug === member.favoriteFighterSlug) ?? null
              : null;
            return (
              <Link
                className={`surface-card member-directory-card${member.isCurrentUser ? " is-current" : ""}`}
                key={member.displayName}
                to={memberProfilePath(member.displayName)}
                aria-label={`View ${member.displayName} member profile`}
              >
                <div className="member-directory-card__topline">
                  <div className="member-initials">{member.initials}</div>
                  {member.isCurrentUser ? <span>YOU</span> : <span>MEMBER</span>}
                </div>
                <h2>{member.displayName}</h2>
                <div className="member-favorite-row">
                  {favorite ? (
                    <FighterPhoto name={favorite.name} src={favorite.thumbUrl} />
                  ) : (
                    <i aria-hidden="true">{member.initials}</i>
                  )}
                  <span>
                    <small>FAVORITE FIGHTER</small>
                    <strong>{favorite?.name ?? "Not set"}</strong>
                  </span>
                </div>
                <div className="member-card-stats">
                  <div><strong>{member.currentStreak}</strong><span>DAY STREAK</span></div>
                  <div><strong>{member.picksCorrect}-{member.picksIncorrect}</strong><span>PICKS RECORD</span></div>
                </div>
                <b className="member-card-action">VIEW PROFILE →</b>
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="surface-card member-state-card">
          <div className="member-initials" aria-hidden="true">HQ</div>
          <div><p className="eyebrow">DIRECTORY</p><h2>No members are available yet</h2><p>New registered profiles will appear here automatically.</p></div>
        </section>
      )}
    </div>
  );
}

export default function MemberDirectoryPage() {
  return <MemberDirectoryView />;
}
