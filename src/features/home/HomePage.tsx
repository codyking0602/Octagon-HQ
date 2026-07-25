import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  challengeDirection,
  type PlayChallenge,
} from "../challenges/challengeModel";
import { challengePlayRoute } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import { useFindLeaderHistory } from "../play/FindLeaderHistoryProvider";
import { centralDay } from "../play/findLeaderEngine";
import { findLeaderStreaks } from "../play/findLeaderStorage";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { allTime, menAllTime } from "../rankings/rankingModel";
import {
  meaningfulOpenChallenges,
  mostRelevantOpenChallenge,
} from "./yourHqModel";

function nextAction(
  openChallenges: readonly PlayChallenge[],
  profileId: string,
  playedToday: boolean,
) {
  const relevant = mostRelevantOpenChallenge(openChallenges, profileId);
  if (relevant && challengeDirection(relevant, profileId) === "received") {
    return {
      label: `PLAY ${relevant.gameTitle.toUpperCase()} CHALLENGE`,
      to: challengePlayRoute(relevant),
    };
  }
  if (openChallenges.length) {
    return { label: "OPEN CHALLENGE CENTER", to: "/play#challenge-center" };
  }
  return playedToday
    ? { label: "PLAY ANOTHER UFC GAME", to: "/play" }
    : { label: "PLAY TODAY’S FIND THE LEADER", to: "/play/find-leader" };
}

export default function HomePage() {
  const identity = useIdentity();
  const history = useFindLeaderHistory();
  const preferences = useProfilePreferences();
  const challengeState = usePlayChallenges();
  const today = useMemo(() => centralDay(), []);
  const sortedFighters = useMemo(
    () => allTime.slice().sort((left, right) => left.name.localeCompare(right.name)),
    [],
  );
  const favorite = preferences.favoriteFighterSlug
    ? allTime.find((fighter) => fighter.slug === preferences.favoriteFighterSlug) ?? null
    : null;
  const streak = findLeaderStreaks(history.rows, today);
  const playedToday = history.rows.some((row) => row.day === today);
  const openChallenges = identity.profile
    ? meaningfulOpenChallenges(challengeState.challenges, identity.profile.id)
    : [];
  const action = identity.profile
    ? nextAction(openChallenges, identity.profile.id, playedToday)
    : null;

  return (
    <div className="page home-page">
      <section className="page-heading">
        <p className="eyebrow">YOUR UFC HOME</p>
        <h1>Welcome to Octagon HQ</h1>
        <p>Rank fighters. Make picks. Challenge friends. Settle UFC debates.</p>
      </section>

      <section className="surface-card hq-card" aria-labelledby="your-hq-title">
        <div className="section-heading hq-card__heading">
          <div>
            <p className="eyebrow">PERSONALIZED</p>
            <h2 id="your-hq-title">Your HQ</h2>
          </div>
          {identity.profile ? (
            <span className="hq-card__profile">{identity.profile.displayName}</span>
          ) : null}
        </div>

        {!identity.profile ? (
          <div className="hq-card__signed-out">
            <div className="hq-card__grid" aria-label="Your HQ profile benefits">
              <article className="hq-stat"><strong>—</strong><span>Daily streak</span><small>SYNC ACROSS DEVICES</small></article>
              <article className="hq-stat"><strong>—</strong><span>Current Picks record</span><small>PROFILE PICKS NEXT</small></article>
              <article className="hq-stat"><strong>—</strong><span>Favorite fighter</span><small>MAKE IT YOUR HQ</small></article>
              <article className="hq-stat"><strong>—</strong><span>Open challenges</span><small>PLAY FRIENDS</small></article>
            </div>
            <p>Sign in to carry your official game history, favorite fighter, and challenges between devices.</p>
            <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO YOUR HQ</button>
          </div>
        ) : (
          <>
            <div className="hq-card__grid">
              <article className="hq-stat">
                <strong>{history.loading ? "…" : streak.current}</strong>
                <span>Daily streak</span>
                <small>FIND THE LEADER</small>
              </article>

              <article className="hq-stat is-unavailable">
                <strong>—</strong>
                <span>Current Picks record</span>
                <small>PROFILE PICKS NEXT</small>
              </article>

              <article className="hq-stat hq-stat--favorite">
                <div className="hq-stat__favorite-value">
                  {favorite ? <FighterPhoto name={favorite.name} src={favorite.thumbUrl} /> : null}
                  <strong>{preferences.loading ? "…" : favorite?.name ?? "SET ONE"}</strong>
                </div>
                <label>
                  <span>Favorite fighter</span>
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
              </article>

              <article className="hq-stat">
                <strong>{challengeState.loading ? "…" : openChallenges.length}</strong>
                <span>Open challenges</span>
                <small>NEW, OPENED OR WAITING</small>
              </article>
            </div>

            {history.error || preferences.error || challengeState.error ? (
              <p className="hq-card__error" role="status">
                {history.error || preferences.error || challengeState.error}
              </p>
            ) : null}

            <Link className="primary-action" to={action!.to}>{action!.label}</Link>
          </>
        )}
      </section>

      <section className="surface-card board-preview" aria-labelledby="board-preview-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TOP OF THE BOARD</p>
            <h2 id="board-preview-title">UFC all-time</h2>
          </div>
          <Link className="text-link" to="/rankings">View all 80</Link>
        </div>
        <div className="board-preview__list">
          {menAllTime.slice(0, 3).map((fighter) => (
            <Link className="board-preview__row" to={`/fighters/${fighter.slug}`} key={fighter.slug}>
              <span className="board-preview__rank">{fighter.rank}</span>
              <FighterPhoto name={fighter.name} src={fighter.thumbUrl} />
              <span><strong>{fighter.name}</strong><small>{fighter.visibleStats.ufcRecord} UFC · {fighter.division}</small></span>
              <b>{fighter.ovr}</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
