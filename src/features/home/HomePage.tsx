import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import {
  eventPicksLocked,
  mainEvent,
  pickProgress,
  pickRecord,
} from "../picks/picksModel";
import { usePicks } from "../picks/PicksProvider";
import { useTodayChallengeOverview } from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { allTime } from "../rankings/rankingModel";
import { WhatsNewPreview } from "../whats-new/WhatsNewPreview";
import { dailyRankingSpotlight } from "./homeSpotlightModel";
import { RankingSpotlightCard } from "./RankingSpotlightCard";
import { ShanesWatchlistCard } from "./ShanesWatchlistCard";
import {
  buildYourHqNextAction,
  meaningfulOpenChallenges,
} from "./yourHqModel";

function eventDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function readableError(error: unknown) {
  return error instanceof Error && error.message ? error.message : "";
}

export default function HomePage() {
  const identity = useIdentity();
  const preferences = useProfilePreferences();
  const picks = usePicks();
  const challengeState = usePlayChallenges();
  const profileId = identity.profile?.id ?? "signed-out";
  const signedIn = Boolean(identity.profile?.id);
  const dailyRuntime = useTodayChallengeRuntime({ profileId, enabled: signedIn });
  const dailyOverview = useTodayChallengeOverview({
    profileId,
    enabled: signedIn,
    projection: dailyRuntime.projection,
  });
  const sortedFighters = useMemo(
    () => allTime.slice().sort((left, right) => left.displayName.localeCompare(right.displayName)),
    [],
  );
  const spotlight = useMemo(() => dailyRankingSpotlight(allTime, new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())), []);
  const favorite = preferences.favoriteFighterSlug
    ? allTime.find((fighter) => fighter.slug === preferences.favoriteFighterSlug) ?? null
    : null;
  const dailyLoading = dailyRuntime.loading || dailyOverview.loading;
  const dailyError = readableError(dailyRuntime.error) || readableError(dailyOverview.error);
  const playedToday = Boolean(dailyRuntime.projection?.officialAttempt);
  const currentStreak = dailyOverview.streak.currentStreak;
  const openChallenges = identity.profile
    ? meaningfulOpenChallenges(challengeState.challenges, identity.profile.id)
    : [];
  const action = identity.profile
    ? buildYourHqNextAction({
        openChallenges,
        profiles: challengeState.profiles,
        profileId: identity.profile.id,
        playedToday,
        currentStreak,
      })
    : null;
  const currentEvent = picks.event;
  const currentMainEvent = mainEvent(currentEvent);
  const picksProgress = pickProgress(currentEvent, picks.selections);
  const picksPercent = picksProgress.total
    ? Math.round((picksProgress.completed / picksProgress.total) * 100)
    : 0;
  const picksLocked = currentEvent ? eventPicksLocked(currentEvent) : false;

  return (
    <div className="page home-page">
      <section className="page-heading">
        <p className="eyebrow">YOUR UFC HOME</p>
        <h1>Welcome to Octagon HQ</h1>
        <p>Rank fighters. Make picks. Challenge friends. Settle UFC debates.</p>
      </section>

      <section className="surface-card hq-card" aria-labelledby="your-hq-title">
        <div className="section-heading hq-card__heading">
          <h2 id="your-hq-title">Your HQ</h2>
        </div>

        {!identity.profile ? (
          <div className="hq-card__signed-out">
            <div className="hq-card__grid" aria-label="Your HQ profile benefits">
              <article className="hq-stat"><strong>—</strong><span>Daily streak</span><small>SYNC ACROSS DEVICES</small></article>
              <article className="hq-stat"><strong>—</strong><span>Current Picks record</span><small>SIGN IN TO TRACK</small></article>
              <article className="hq-stat"><strong>—</strong><span>Favorite fighter</span><small>MAKE IT YOUR HQ</small></article>
              <article className="hq-stat"><strong>—</strong><span>Open challenges</span><small>PLAY FRIENDS</small></article>
            </div>
            <p>Sign in to carry your official game history, Picks record, favorite fighter, and challenges between devices.</p>
            <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO YOUR HQ</button>
          </div>
        ) : (
          <>
            <div className="hq-card__grid">
              <article className="hq-stat">
                <strong>{dailyLoading ? "…" : currentStreak}</strong>
                <span>Daily streak</span>
                <small>TODAY’S CHALLENGE</small>
              </article>

              <article className="hq-stat">
                <strong>{picks.loading ? "…" : pickRecord(picks.summary)}</strong>
                <span>Current Picks record</span>
                <small>
                  {currentEvent?.season ?? new Date().getFullYear()} SEASON
                  {picks.summary.pending ? ` · ${picks.summary.pending} PENDING` : ""}
                </small>
              </article>

              <article className="hq-stat hq-stat--favorite">
                {favorite ? (
                  <Link
                    className="hq-stat__favorite-value hq-stat__favorite-link"
                    to={`/fighters/${favorite.slug}`}
                    aria-label={`Open ${favorite.displayName} profile`}
                  >
                    <FighterPhoto name={favorite.displayName} src={favorite.thumbUrl} />
                    <strong>{favorite.displayName}</strong>
                  </Link>
                ) : (
                  <div className="hq-stat__favorite-value">
                    <strong>{preferences.loading ? "…" : "SET ONE"}</strong>
                  </div>
                )}
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
                      <option value={fighter.slug} key={fighter.slug}>{fighter.displayName}</option>
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

            {dailyError || preferences.error || picks.error || challengeState.error ? (
              <p className="hq-card__error" role="status">
                {dailyError || preferences.error || picks.error || challengeState.error}
              </p>
            ) : null}

            <div className="hq-next-up">
              <div className="hq-next-up__copy">
                <small>NEXT UP</small>
                <strong>{action!.title}</strong>
                <p>{action!.description}</p>
              </div>
              <Link className="primary-action" to={action!.to}>{action!.label}</Link>
            </div>
          </>
        )}
      </section>

      <WhatsNewPreview />

      {currentEvent ? (
        <section className="surface-card home-event-card" aria-labelledby="home-event-title">
          <div className="home-event-card__topline">
            <p className="eyebrow">NEXT UFC EVENT</p>
            <span>{picksLocked ? "LOCKED" : "UPCOMING"}</span>
          </div>
          <h2 id="home-event-title">{currentEvent.name}</h2>
          <strong>{currentEvent.subtitle}</strong>
          <p>{eventDate(currentEvent.startsAt)}</p>
          {currentMainEvent ? (
            <p className="home-event-card__main-event">
              <small>MAIN EVENT</small>
              <b>{currentMainEvent.redFighterName} vs. {currentMainEvent.blueFighterName}</b>
            </p>
          ) : null}
          <div className="picks-progress" aria-label={`${picksProgress.completed} of ${picksProgress.total} picks completed`}>
            <div>
              <span>{identity.profile ? "YOUR PICKS" : "PROFILE PICKS"}</span>
              <b>{identity.profile ? `${picksProgress.completed} OF ${picksProgress.total}` : "SIGN IN"}</b>
            </div>
            <div className="picks-progress__track" aria-hidden="true"><span style={{ width: `${picksPercent}%` }} /></div>
          </div>
          {identity.profile ? (
            <Link className="secondary-action" to="/picks">
              {picksProgress.completed === picksProgress.total ? "REVIEW PICKS" : "MAKE PICKS"} →
            </Link>
          ) : (
            <button className="secondary-action" type="button" onClick={identity.openDialog}>SIGN IN TO MAKE PICKS →</button>
          )}
        </section>
      ) : null}

      {spotlight ? <RankingSpotlightCard fighter={spotlight} /> : null}
      <ShanesWatchlistCard />
    </div>
  );
}
