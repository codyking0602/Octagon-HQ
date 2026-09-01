import { useEffect, useMemo } from "react";
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
import { todayChallengeAdapter } from "../play/todaysChallengeAdapters";
import { useTodayChallengeOverview } from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { allTime } from "../rankings/rankingModel";
import { WhatsNewPreview } from "../whats-new/WhatsNewPreview";
import { useWhatsNew } from "../whats-new/WhatsNewProvider";
import { dailyRankingSpotlight } from "./homeSpotlightModel";
import { RankingSpotlightCard } from "./RankingSpotlightCard";
import { ShanesWatchlistCard } from "./ShanesWatchlistCard";
import { buildUpNextAction } from "./upNextModel";
import {
  buildDirectChallengeAction,
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

function dailyChallengeStatus({
  signedIn,
  configured,
  loading,
  error,
  progressRevision,
  completedScore,
}: {
  signedIn: boolean;
  configured: boolean;
  loading: boolean;
  error: unknown;
  progressRevision: number | undefined;
  completedScore: number | undefined;
}) {
  if (!signedIn) {
    return { label: "SIGN IN TO PLAY", detail: "SYNC YOUR DAILY GAME", action: "OPEN" };
  }
  if (loading) {
    return { label: "SYNCING", detail: "LOADING TODAY", action: "OPEN" };
  }
  if (error || !configured) {
    return { label: "UNAVAILABLE", detail: "TRY THE GAME DIRECTLY", action: "OPEN" };
  }
  if (typeof completedScore === "number") {
    return { label: "COMPLETED", detail: `${completedScore}/100`, action: "VIEW RESULT" };
  }
  if ((progressRevision ?? 0) > 0) {
    return { label: "IN PROGRESS", detail: "PICK UP WHERE YOU LEFT OFF", action: "CONTINUE" };
  }
  return { label: "NOT PLAYED", detail: "READY FOR TODAY", action: "PLAY NOW" };
}

export default function HomePage() {
  const identity = useIdentity();
  const picks = usePicks();
  const challengeState = usePlayChallenges();
  const whatsNew = useWhatsNew();
  const profileId = identity.profile?.id ?? "signed-out";
  const signedIn = Boolean(identity.profile?.id);

  const dailyRuntime = useTodayChallengeRuntime({ profileId, enabled: signedIn });
  const dailyOverview = useTodayChallengeOverview({
    profileId,
    enabled: signedIn,
    projection: dailyRuntime.projection,
  });
  const dailyAdapter = todayChallengeAdapter(dailyRuntime.projection?.gameType);

  const footballDailyRuntime = useTodayChallengeRuntime({
    profileId,
    enabled: signedIn,
    sport: "football",
  });
  const footballDailyAdapter = todayChallengeAdapter(footballDailyRuntime.projection?.gameType);

  useEffect(() => {
    if (!signedIn) return;
    void picks.loadFootballSummary();
  }, [picks.loadFootballSummary, signedIn]);

  const spotlight = useMemo(() => dailyRankingSpotlight(allTime, new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())), []);

  const dailyLoading = dailyRuntime.loading || dailyOverview.loading;
  const dailyError = readableError(dailyRuntime.error) || readableError(dailyOverview.error);
  const playedToday = Boolean(dailyRuntime.projection?.officialAttempt);
  const currentStreak = dailyOverview.streak.currentStreak;
  const openChallenges = identity.profile
    ? meaningfulOpenChallenges(challengeState.challenges, identity.profile.id)
    : [];
  const currentEvent = picks.event;
  const directChallengeAction = identity.profile
    ? buildDirectChallengeAction({
        openChallenges,
        profiles: challengeState.profiles,
        profileId: identity.profile.id,
      })
    : null;
  const upNextLoading = picks.loading || (
    signedIn
      && (
        dailyLoading
          || challengeState.loading
          || whatsNew.status === "idle"
          || whatsNew.status === "loading"
      )
  );
  const upNext = upNextLoading
    ? null
    : buildUpNextAction({
        signedIn,
        picksEvent: currentEvent,
        selections: picks.selections,
        playedToday,
        currentStreak,
        dailyChallengeTitle: dailyAdapter?.title,
        dailyChallengeRoute: dailyAdapter?.dailyRoute,
        challengeAction: directChallengeAction,
        whatsNewItems: whatsNew.activeItems,
      });

  const ufcChallengeStatus = dailyChallengeStatus({
    signedIn,
    configured: dailyRuntime.configured,
    loading: dailyRuntime.loading,
    error: dailyRuntime.error,
    progressRevision: dailyRuntime.projection?.progressRevision,
    completedScore: dailyRuntime.projection?.officialAttempt?.normalizedScore,
  });
  const footballChallengeStatus = dailyChallengeStatus({
    signedIn,
    configured: footballDailyRuntime.configured,
    loading: footballDailyRuntime.loading,
    error: footballDailyRuntime.error,
    progressRevision: footballDailyRuntime.projection?.progressRevision,
    completedScore: footballDailyRuntime.projection?.officialAttempt?.normalizedScore,
  });

  const dailyStreakValue = dailyLoading
    ? "…"
    : dailyError || !dailyOverview.configured
      ? "—"
      : String(currentStreak);
  const ufcPicksRecord = picks.loading
    ? "…"
    : picks.error || !picks.configured
      ? "—"
      : pickRecord(picks.summary);
  const footballPicksRecord = picks.footballSummaryLoading
    ? "…"
    : picks.footballSummaryError || !picks.footballSummary
      ? "—"
      : pickRecord(picks.footballSummary);

  const currentMainEvent = mainEvent(currentEvent);
  const picksProgress = pickProgress(currentEvent, picks.selections);
  const picksPercent = picksProgress.total
    ? Math.round((picksProgress.completed / picksProgress.total) * 100)
    : 0;
  const picksLocked = currentEvent ? eventPicksLocked(currentEvent) : false;

  return (
    <div className="page home-page">
      <section className="page-heading home-command-heading">
        <p className="eyebrow">THE HQ</p>
        <h1>Your command center</h1>
        <p>Picks, games, rankings, updates, and everything next across The HQ.</p>
      </section>

      <section
        className="home-section home-section--up-next"
        data-testid="home-section"
        data-home-section="up-next"
        aria-label="Up Next"
      >
        {upNextLoading ? (
          <div className="up-next-hero up-next-hero--loading" aria-label="Loading Up Next">
            <span />
            <span />
            <span />
          </div>
        ) : upNext ? (
          <article className="up-next-hero" data-up-next-kind={upNext.kind}>
            <div className="up-next-hero__topline">
              <span>UP NEXT</span>
              <small>{upNext.kicker}</small>
            </div>
            <div className="up-next-hero__copy">
              <h2>{upNext.title}</h2>
              <p>{upNext.description}</p>
              {upNext.startsAt ? (
                <time dateTime={upNext.startsAt}>{eventDate(upNext.startsAt)}</time>
              ) : null}
            </div>
            <Link className="up-next-hero__action" to={upNext.to}>
              {upNext.label}<span aria-hidden="true">→</span>
            </Link>
          </article>
        ) : null}
      </section>

      <section
        className="home-section home-section--todays-challenges"
        data-testid="home-section"
        data-home-section="todays-challenges"
        aria-label="Today’s Challenges"
      >
        <section className="surface-card hq-card todays-challenges-card" aria-labelledby="todays-challenges-title">
          <div className="section-heading hq-card__heading">
            <h2 id="todays-challenges-title">Today’s Challenges</h2>
          </div>
          <div className="hq-card__grid">
            <article
              className="hq-stat today-challenge-card"
              data-testid="today-challenge-ufc"
              data-hq-theme="ufc"
            >
              <p className="eyebrow">UFC</p>
              <h3>{dailyAdapter?.title ?? "Today’s Challenge"}</h3>
              <small>{ufcChallengeStatus.label} · {ufcChallengeStatus.detail}</small>
              <Link className="primary-action" to={dailyAdapter?.dailyRoute ?? "/play"}>
                {ufcChallengeStatus.action} →
              </Link>
            </article>

            <article
              className="hq-stat today-challenge-card"
              data-testid="today-challenge-football"
              data-hq-theme="football"
            >
              <p className="eyebrow">FOOTBALL</p>
              <h3>{footballDailyAdapter?.title ?? "Today’s Challenge"}</h3>
              <small>{footballChallengeStatus.label} · {footballChallengeStatus.detail}</small>
              <Link className="primary-action" to="/football/today">
                {footballChallengeStatus.action} →
              </Link>
            </article>
          </div>
        </section>
      </section>

      <section
        className="home-section home-section--whats-new"
        data-testid="home-section"
        data-home-section="whats-new"
        aria-label="What’s New"
      >
        <WhatsNewPreview />
      </section>

      <section
        className="home-section home-section--your-hq"
        data-testid="home-section"
        data-home-section="your-hq"
        aria-label="Your HQ"
      >
        <section className="surface-card hq-card" aria-labelledby="your-hq-title">
          <div className="section-heading hq-card__heading">
            <h2 id="your-hq-title">Your HQ</h2>
          </div>

          {!identity.profile ? (
            <div className="hq-card__signed-out">
              <div className="hq-card__grid hq-card__grid--three" aria-label="Your HQ profile benefits">
                <article className="hq-stat"><strong>—</strong><span>Daily streak</span><small>SYNC ACROSS DEVICES</small></article>
                <article className="hq-stat"><strong>—</strong><span>UFC Picks record</span><small>SIGN IN TO TRACK</small></article>
                <article className="hq-stat"><strong>—</strong><span>Football Picks record</span><small>SIGN IN TO TRACK</small></article>
              </div>
              <p>Sign in to sync your daily streak and both Picks records across devices.</p>
              <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO YOUR HQ</button>
            </div>
          ) : (
            <>
              <div className="hq-card__grid hq-card__grid--three">
                <article className={`hq-stat${dailyStreakValue === "—" ? " is-unavailable" : ""}`}>
                  <strong>{dailyStreakValue}</strong>
                  <span>Daily streak</span>
                  <small>TODAY’S CHALLENGE</small>
                </article>

                <article className={`hq-stat${ufcPicksRecord === "—" ? " is-unavailable" : ""}`}>
                  <strong>{ufcPicksRecord}</strong>
                  <span>UFC Picks record</span>
                  <small>
                    CURRENT SEASON
                    {picks.summary.pending ? ` · ${picks.summary.pending} PENDING` : ""}
                  </small>
                </article>

                <article className={`hq-stat${footballPicksRecord === "—" ? " is-unavailable" : ""}`}>
                  <strong>{footballPicksRecord}</strong>
                  <span>Football Picks record</span>
                  <small>
                    CURRENT SEASON
                    {picks.footballSummary?.pending ? ` · ${picks.footballSummary.pending} PENDING` : ""}
                  </small>
                </article>
              </div>

              {dailyError || picks.error || picks.footballSummaryError ? (
                <p className="hq-card__error" role="status">
                  {dailyError || picks.error || picks.footballSummaryError}
                </p>
              ) : null}
            </>
          )}
        </section>
      </section>

      <section
        className="home-section home-section--ufc-hq"
        data-testid="home-section"
        data-home-section="ufc-hq"
        aria-label="UFC HQ"
      >
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
      </section>

      <section
        className="home-section home-section--football-hq"
        data-testid="home-section"
        data-home-section="football-hq"
        aria-label="Football HQ"
      />
    </div>
  );
}
