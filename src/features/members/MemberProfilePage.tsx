import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  challengeDirection,
  challengeStatus,
  type PlayChallenge,
} from "../challenges/challengeModel";
import {
  challengeCounterpart,
  usePlayChallenges,
} from "../challenges/ChallengeProvider";
import {
  challengeResultScoreLabel,
  challengeResultVerdict,
} from "../challenges/ChallengeResultDetails";
import { useIdentity } from "../identity/IdentityProvider";
import { usePicks } from "../picks/PicksProvider";
import { useFindLeaderHistory } from "../play/FindLeaderHistoryProvider";
import { centralDay } from "../play/findLeaderEngine";
import { findLeaderStreaks } from "../play/findLeaderStorage";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { allTime } from "../rankings/rankingModel";
import { MemberAvatarEditor } from "./MemberAvatarEditor";
import {
  challengeIsComparisonOnly,
  challengesSharedWithMember,
  memberAchievements,
  memberProfilePath,
  normalizeMemberName,
  summarizeMemberChallenges,
  type MemberProfileSummary,
  type MemberRecentActivityItem,
} from "./memberProfilesModel";
import {
  createMemberProfilesRepository,
  type MemberProfilesRepository,
} from "./memberProfilesRepository";

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not load that member profile.";
}

function completedChallengeCopy(
  challenge: PlayChallenge,
  profiles: ReturnType<typeof usePlayChallenges>["profiles"],
  activeProfileId: string,
) {
  const creator = profiles.find((profile) => profile.id === challenge.creatorId);
  const responder = profiles.find((profile) => profile.id === challenge.recipientId);
  const creatorName = creator?.displayName ?? (challenge.creatorId === activeProfileId ? "YOU" : "SENDER");
  const responderName = responder?.displayName ?? (challenge.recipientId === activeProfileId ? "YOU" : "RESPONDER");
  const verdict = challengeResultVerdict(challenge, creatorName, responderName);

  if (challengeIsComparisonOnly(challenge)) {
    return {
      headline: verdict,
      detail: "COMPARISON · NO OFFICIAL WINNER",
    };
  }

  return {
    headline: verdict,
    detail: `${creatorName} ${challengeResultScoreLabel(challenge, challenge.creatorResult)} · ${responderName} ${challengeResultScoreLabel(challenge, challenge.responderResult)}`,
  };
}

function activityDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "RECENT";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date).toUpperCase();
}

function profileAvatar(member: MemberProfileSummary) {
  return member.avatarPhotoData ? (
    <img src={member.avatarPhotoData} alt={`${member.displayName} avatar`} />
  ) : (
    <span>{member.initials}</span>
  );
}

export function MemberProfileView({
  memberName,
  repository: suppliedRepository,
}: {
  memberName: string;
  repository?: MemberProfilesRepository | null;
}) {
  const navigate = useNavigate();
  const identity = useIdentity();
  const preferences = useProfilePreferences();
  const picks = usePicks();
  const history = useFindLeaderHistory();
  const challengeState = usePlayChallenges();
  const [repository] = useState<MemberProfilesRepository | null>(() => (
    suppliedRepository === undefined ? createMemberProfilesRepository() : suppliedRepository
  ));
  const [remoteMember, setRemoteMember] = useState<MemberProfileSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const revisionRef = useRef(0);
  const today = useMemo(() => centralDay(), []);
  const requestedName = normalizeMemberName(memberName);
  const isOwnProfile = Boolean(
    identity.profile
      && normalizeMemberName(identity.profile.displayName) === requestedName,
  );

  useEffect(() => {
    const revision = ++revisionRef.current;
    if (!identity.profile) {
      setRemoteMember(null);
      setLoading(false);
      setError("");
      return;
    }
    if (!repository) {
      setRemoteMember(null);
      setLoading(false);
      setError(isOwnProfile ? "" : "Member Profiles are not connected on this build.");
      return;
    }

    setLoading(!isOwnProfile);
    void repository.loadMember(requestedName)
      .then((member) => {
        if (revision !== revisionRef.current) return;
        setRemoteMember(member);
        setError("");
      })
      .catch((nextError) => {
        if (revision !== revisionRef.current) return;
        setRemoteMember(null);
        setError(isOwnProfile ? "" : readableError(nextError));
      })
      .finally(() => {
        if (revision === revisionRef.current) setLoading(false);
      });
  }, [identity.profile?.id, isOwnProfile, repository, requestedName]);

  const ownStreaks = findLeaderStreaks(history.rows, today);
  const fallbackOwnActivity = history.rows.slice(0, 5).map<MemberRecentActivityItem>((row) => ({
    kind: "find-leader",
    title: "Find the Leader",
    detail: `${row.officialScore}/10`,
    occurredAt: row.completedAt,
  }));
  const ownRecentActivity = remoteMember?.recentActivity?.length
    ? remoteMember.recentActivity
    : fallbackOwnActivity;
  const ownMember: MemberProfileSummary | null = identity.profile && isOwnProfile ? {
    displayName: identity.profile.displayName,
    initials: identity.profile.initials,
    avatarPhotoData: preferences.avatarPhotoData,
    favoriteFighterSlug: preferences.favoriteFighterSlug,
    currentStreak: ownStreaks.current,
    bestStreak: ownStreaks.best,
    perfectRuns: ownStreaks.perfect,
    recordedDays: ownStreaks.total,
    bestFindLeaderScore: history.rows.reduce(
      (best, row) => Math.max(best, row.officialScore),
      0,
    ),
    picksCorrect: picks.summary.correct,
    picksIncorrect: picks.summary.incorrect,
    picksPending: picks.summary.pending,
    picksEventsEntered: picks.summary.eventsEntered,
    recentActivity: ownRecentActivity,
    isCurrentUser: true,
  } : null;
  const member = ownMember ?? remoteMember;
  const favorite = member?.favoriteFighterSlug
    ? allTime.find((fighter) => fighter.slug === member.favoriteFighterSlug) ?? null
    : null;
  const sortedFighters = useMemo(
    () => allTime.slice().sort((left, right) => left.name.localeCompare(right.name)),
    [],
  );

  const relevantChallenges = useMemo(() => {
    if (!identity.profile || !member) return [];
    if (isOwnProfile) {
      return challengeState.challenges
        .slice()
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    }
    return challengesSharedWithMember(
      challengeState.challenges,
      challengeState.profiles,
      identity.profile.id,
      member.displayName,
    );
  }, [challengeState.challenges, challengeState.profiles, identity.profile, isOwnProfile, member]);
  const challengeSummary = identity.profile
    ? summarizeMemberChallenges(relevantChallenges, identity.profile.id)
    : { open: 0, completed: 0, sent: 0, received: 0 };

  function startMemberChallenge() {
    if (!member || isOwnProfile) return;
    challengeState.prepareRecipient(member.displayName);
    navigate("/play");
  }

  if (!identity.profile) {
    return (
      <div className="page member-profile-page">
        <section className="surface-card member-state-card">
          <div className="member-initials" aria-hidden="true">HQ</div>
          <div>
            <p className="eyebrow">MEMBERS ONLY</p>
            <h1>Sign in to view member profiles</h1>
            <p>Member stats and challenge activity stay inside Octagon HQ.</p>
          </div>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO VIEW PROFILE</button>
        </section>
      </div>
    );
  }

  if (loading) {
    return <div className="page member-profile-page"><section className="surface-card member-state-card"><div className="member-initials">HQ</div><div><p className="eyebrow">SYNCING</p><h1>Loading member profile…</h1></div></section></div>;
  }

  if (error || !member) {
    return (
      <div className="page member-profile-page">
        <section className="surface-card member-state-card" role="status">
          <div className="member-initials" aria-hidden="true">?</div>
          <div>
            <p className="eyebrow">PROFILE UNAVAILABLE</p>
            <h1>{error ? "Member profile could not load" : "Member not found"}</h1>
            <p>{error || "That registered Octagon HQ member does not exist."}</p>
          </div>
          <Link className="secondary-action" to="/members">BACK TO MEMBERS</Link>
        </section>
      </div>
    );
  }

  const profileLoading = isOwnProfile && (history.loading || preferences.loading || picks.loading);
  const gradedPicks = member.picksCorrect + member.picksIncorrect;
  const picksAccuracy = gradedPicks ? Math.round((member.picksCorrect / gradedPicks) * 100) : 0;
  const achievements = memberAchievements(member, challengeSummary);
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const recentActivity = member.recentActivity ?? [];

  return (
    <div className="page member-profile-page">
      <Link className="member-profile-back" to="/members">← ALL MEMBERS</Link>

      <section className={`surface-card member-profile-hero${isOwnProfile ? " is-own" : ""}`}>
        <div className="member-profile-hero__identity">
          <div className="member-profile-avatar">{profileAvatar(member)}</div>
          <div>
            <p className="eyebrow">{isOwnProfile ? "YOUR OCTAGON HQ PROFILE" : "OCTAGON HQ MEMBER"}</p>
            <h1>{member.displayName}</h1>
            <p className="member-profile-role">GOAT26 MEMBER · GAMES, PICKS, AND CHALLENGES</p>
          </div>
        </div>

        <div className="member-profile-favorite-card">
          <div className="member-profile-favorite-photo">
            {favorite ? <FighterPhoto name={favorite.name} src={favorite.thumbUrl} /> : <span>UFC</span>}
          </div>
          <p className="member-profile-favorite">
            <small>FAVORITE FIGHTER</small>
            <strong>{favorite?.name ?? "Not set"}</strong>
          </p>
        </div>

        {isOwnProfile ? (
          <label className="member-profile-favorite-control">
            <span>EDIT FAVORITE FIGHTER</span>
            <select
              aria-label="Favorite fighter"
              disabled={preferences.loading || preferences.saving || !preferences.configured}
              value={favorite?.slug ?? ""}
              onChange={(event) => void preferences.setFavoriteFighter(event.target.value || null)}
            >
              <option value="">Choose fighter</option>
              {sortedFighters.map((fighter) => (
                <option value={fighter.slug} key={fighter.slug}>{fighter.name}</option>
              ))}
            </select>
          </label>
        ) : (
          <button className="primary-action member-profile-challenge" type="button" onClick={startMemberChallenge}>
            PLAY A GAME TO CHALLENGE {member.displayName}
          </button>
        )}
      </section>

      {isOwnProfile ? (
        <MemberAvatarEditor
          photoData={preferences.avatarPhotoData}
          initials={member.initials}
          disabled={!preferences.avatarConfigured}
          saving={preferences.savingAvatar}
          onSave={preferences.setAvatarPhoto}
        />
      ) : null}

      <section className="member-profile-stat-grid" aria-label={`${member.displayName} profile stats`}>
        <article className="surface-card"><small>CURRENT STREAK</small><strong>{profileLoading ? "…" : member.currentStreak}</strong><span>Find the Leader days</span></article>
        <article className="surface-card"><small>CURRENT PICKS</small><strong>{profileLoading ? "…" : `${member.picksCorrect}-${member.picksIncorrect}`}</strong><span>{member.picksPending ? `${member.picksPending} pending` : "Current season"}</span></article>
        <article className="surface-card"><small>ACHIEVEMENTS</small><strong>{profileLoading ? "…" : unlockedAchievements}</strong><span>of {achievements.length} unlocked</span></article>
        <article className="surface-card"><small>OPEN CHALLENGES</small><strong>{challengeState.loading ? "…" : challengeSummary.open}</strong><span>{isOwnProfile ? "Across HQ" : "With you"}</span></article>
      </section>

      <section className="surface-card member-profile-data-section" aria-labelledby="member-find-leader-title">
        <div className="section-heading">
          <div><p className="eyebrow">DAILY GAME</p><h2 id="member-find-leader-title">Find the Leader</h2></div>
        </div>
        <div className="member-profile-metric-grid">
          <div><strong>{member.bestStreak}</strong><span>BEST STREAK</span></div>
          <div><strong>{member.perfectRuns}</strong><span>PERFECT 10s</span></div>
          <div><strong>{member.recordedDays}</strong><span>RECORDED DAYS</span></div>
          <div><strong>{member.recordedDays ? `${member.bestFindLeaderScore}/10` : "—"}</strong><span>BEST SCORE</span></div>
        </div>
      </section>

      <section className="surface-card member-profile-data-section" aria-labelledby="member-picks-title">
        <div className="section-heading">
          <div><p className="eyebrow">UFC PICKS</p><h2 id="member-picks-title">Current season</h2></div>
        </div>
        <div className="member-profile-metric-grid">
          <div><strong>{member.picksCorrect}-{member.picksIncorrect}</strong><span>RECORD</span></div>
          <div><strong>{picksAccuracy}%</strong><span>ACCURACY</span></div>
          <div><strong>{member.picksPending}</strong><span>PENDING</span></div>
          <div><strong>{member.picksEventsEntered}</strong><span>EVENTS ENTERED</span></div>
        </div>
      </section>

      <section className="surface-card member-profile-data-section member-profile-resume" aria-labelledby="member-achievements-title">
        <div className="section-heading">
          <div><p className="eyebrow">ACHIEVEMENTS</p><h2 id="member-achievements-title">Octagon HQ résumé</h2></div>
          <span>{unlockedAchievements}/{achievements.length} UNLOCKED</span>
        </div>
        <div className="member-profile-badge-grid">
          {achievements.map((achievement) => (
            <article className={achievement.unlocked ? "is-unlocked" : "is-locked"} key={achievement.id}>
              <i aria-hidden="true">{achievement.unlocked ? "✓" : "·"}</i>
              <div><strong>{achievement.title}</strong><span>{achievement.detail}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card member-profile-data-section member-profile-activity" aria-labelledby="member-activity-title">
        <div className="section-heading">
          <div><p className="eyebrow">RECENT ACTIVITY</p><h2 id="member-activity-title">Latest results</h2></div>
        </div>
        {recentActivity.length ? (
          <div className="member-profile-activity-list">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <article key={`${activity.kind}-${activity.occurredAt}-${index}`}>
                <i aria-hidden="true">{activity.kind === "find-leader" ? "◎" : "✓"}</i>
                <div><strong>{activity.title}</strong><span>{activity.detail}</span></div>
                <small>{activityDate(activity.occurredAt)}</small>
              </article>
            ))}
          </div>
        ) : (
          <div className="member-profile-empty"><strong>No recorded profile activity yet</strong><p>Completed Find the Leader days and graded Picks events will appear here.</p></div>
        )}
      </section>

      <section className="surface-card member-profile-challenges" aria-labelledby="member-challenges-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CHALLENGE ACTIVITY</p>
            <h2 id="member-challenges-title">{isOwnProfile ? "Your matchups" : `Your matchups with ${member.displayName}`}</h2>
          </div>
          <Link className="text-link" to="/play#challenge-center">Challenge Center</Link>
        </div>

        <div className="member-challenge-metrics">
          <div><strong>{challengeSummary.open}</strong><span>OPEN</span></div>
          <div><strong>{challengeSummary.completed}</strong><span>COMPLETED</span></div>
          <div><strong>{challengeSummary.sent}</strong><span>SENT</span></div>
          <div><strong>{challengeSummary.received}</strong><span>RECEIVED</span></div>
        </div>

        {relevantChallenges.length ? (
          <div className="member-recent-challenges">
            {relevantChallenges.slice(0, 3).map((challenge) => {
              const status = challengeStatus(challenge, identity.profile!.id);
              const counterpart = challengeCounterpart(challenge, identity.profile!.id, challengeState.profiles);
              const direction = challengeDirection(challenge, identity.profile!.id);
              const completedCopy = status === "completed"
                ? completedChallengeCopy(challenge, challengeState.profiles, identity.profile!.id)
                : null;
              return (
                <article key={challenge.code}>
                  <div className="member-recent-challenges__identity">
                    <i>{counterpart?.initials ?? "HQ"}</i>
                    <span>
                      <small>{direction === "sent" ? "SENT" : "RECEIVED"} · {status.toUpperCase()}</small>
                      <strong>{challenge.gameTitle}</strong>
                    </span>
                  </div>
                  <div className="member-recent-challenges__copy">
                    <strong>{completedCopy?.headline ?? challenge.summary}</strong>
                    <small>{completedCopy?.detail ?? (status === "declined" ? "Challenge declined" : "Open in Challenge Center")}</small>
                  </div>
                  {status === "completed" ? (
                    <button type="button" onClick={() => challengeState.viewResults(challenge.code)}>RESULTS</button>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="member-profile-empty">
            <strong>{isOwnProfile ? "No profile challenges yet" : `No matchups with ${member.displayName} yet`}</strong>
            <p>{isOwnProfile ? "Finish any game and send the locked result to another member." : "Play a UFC game, then use the existing challenge flow to send it directly."}</p>
          </div>
        )}
      </section>

      {!isOwnProfile ? (
        <section className="member-profile-footer-actions">
          <button className="primary-action" type="button" onClick={startMemberChallenge}>CHALLENGE {member.displayName}</button>
          <Link className="secondary-action" to={memberProfilePath(identity.profile.displayName)}>VIEW MY PROFILE</Link>
        </section>
      ) : null}
    </div>
  );
}

export default function MemberProfilePage() {
  const { memberName = "" } = useParams();
  return <MemberProfileView memberName={memberName} />;
}
