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

type DailyProjection = ReturnType<typeof useTodayChallengeRuntime>["projection"];
type ChallengeSport = "ufc" | "football";

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

function DailyChallengeCard({
  sport,
  signedIn,
  projection,
  loading,
  configured,
  error,
  title,
  to,
}: {
  sport: ChallengeSport;
  signedIn: boolean;
  projection: DailyProjection;
  loading: boolean;
  configured: boolean;
  error: string;
  title: string;
  to: string;
}) {
  const sportLabel = sport === "ufc" ? "UFC" : "Football";
  const completed = Boolean(projection?.officialAttempt);
  const inProgress = Boolean(projection && !completed && projection.progressRevision > 0);
  const unavailable = signedIn && !loading && (!configured || Boolean(error) || !projection);
  const state = !signedIn
    ? "signed-out"
    : loading
      ? "loading"
      : unavailable
        ? "unavailable"
        : completed
          ? "completed"
          : inProgress
            ? "in-progress"
            : "not-played";
  const status = state === "signed-out"
    ? "SIGN IN"
    : state === "loading"
      ? "SYNCING"
      : state === "unavailable"
        ? "UNAVAILABLE"
        : state === "completed"
          ? "COMPLETED"
          : state === "in-progress"
            ? "IN PROGRESS"
            : "NOT PLAYED";
  const detail = state === "signed-out"
    ? "Sign in to play the official daily game."
    : state === "loading"
      ? "Syncing today’s game…"
      : state === "unavailable"
        ? "Open the game to retry today’s sync."
        : state === "completed"
          ? `Score ${projection?.officialAttempt?.normalizedScore ?? 0}/100`
          : state === "in-progress"
            ? "Progress saved. Pick up where you left off."
            : "Today’s official game is ready.";
  const action = state === "completed"
    ? "VIEW RESULT"
    : state === "in-progress"
      ? "CONTINUE"
      : state === "not-played"
        ? "PLAY NOW"
        : `OPEN ${sportLabel.toUpperCase()} PLAY`;

  return (
    <article
      className={`today-challenge-card today-challenge-card--${sport}`}
      data-challenge-sport={sport}
      data-challenge-state={state}
    >
      <div className="today-challenge-card__topline">
        <span>{sportLabel.toUpperCase()}</span>
        <small>{status}</small>
      </div>
      <div className="today-challenge-card__copy">
        <h2>{sportLabel} Today’s Challenge</h2>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      <Link className="today-challenge-card__action" to={to}>
        {action}<span aria-hidden="true">→</span>
      </Link>
    </article>
  );
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
  const footballDailyRuntime = useTodayChallengeRuntime({
    profileId,
    enabled: signedIn,
    sport: "football",
  });
  const dailyAdapter = todayChallengeAdapter(dailyRuntime.projection?.gameType);
  const footballDailyAdapter = todayChallengeAdapter(footballDailyRuntime.projection?.gameType);
  const spotlight = useMemo(() => dailyRankingSpotlight(allTime, new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())), []);
  const dailyLoading = dailyRuntime.loading || dailyOverview.loading;
  const dailyError = readableError(dailyRuntime.error) || readableError(dailyOverview.error);
  const footballDailyError = readableError(footballDailyRuntime.error);
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
  const currentMainEvent = mainEvent(currentEvent);
  const picksProgress = pickProgress(currentEvent, picks.selections);
  const picksPercent = picksProgress.total
    ? Math.round((picksProgress.completed / picksProgress.total) * 100)
    : 0;
  const picksLocked = currentEvent ? eventPicksLocked(currentEvent) : false;
  const yourHqError = dailyError || picks.error || picks.footballSummaryError;

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
        <div className="section-heading today-challenges__heading">
          <div>
            <p className="eyebrow">PLAY TODAY</p>
            <h2>Today’s Challenges</h2>
          </div>
        </div>
        <div className="today-challenges__grid">
          <DailyChallengeCard
            sport="ufc"
            signedIn={signedIn}
            projection={dailyRuntime.projection}
            loading={dailyRuntime.loading}
            configured={dailyRuntime.configured}
            error={readableError(dailyRuntime.error)}
            title={dailyAdapter?.title ?? "Today’s Challenge"}
            to={dailyAdapter?.dailyRoute ?? "/play"}
          />
          <DailyChallengeCard
            sport="football"
            signedIn={signedIn}
            projection={footballDailyRuntime.projection}
            loading={footballDailyRuntime.loading}
            configured={footballDailyRuntime.configured}
            error={footballDailyError}
            title={footballDailyAdapter?.title ?? "Today’s Challenge"}
            to="/football/today"
          />
        </div>
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
              <div className="hq-card__grid" aria-label="Your HQ profile benefits">
                <article className="hq-stat"><strong>—</strong><span>Daily streak</span><small>SYNC ACROSS DEVICES</small></article>
                <article className="hq-stat"><strong>—</strong><span>UFC Picks record</span><small>SIGN IN TO TRACK</small></article>
                <article className="hq-stat"><strong>—</strong><span>Football Picks record</span><small>SIGN IN TO TRACK</small></article>
              </div>
              <p>Sign in to sync your daily streak and UFC + Football Picks records across devices.</p>
              <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO YOUR HQ</button>
            </div>
          ) : (
            <>
              <div className="hq-card__grid">
                <article className={`hq-stat${dailyError ? " is-unavailable" : ""}`}>
                  <strong>{dailyLoading ? "…" : dailyError ? "—" : currentStreak}</strong>
                  <span>Daily streak</span>
                  <small>TODAY’S CHALLENGE</small>
                </article>

                <article className={`hq-stat${picks.error ? " is-unavailable" : ""}`}>
                  <strong>{picks.loading ? "…" : picks.error ? "—" : pickRecord(picks.summary)}</strong>
                  <span>UFC Picks record</span>
                  <small>CURRENT SEASON</small>
                </article>

                <article className={`hq-stat${picks.footballSummaryError ? " is-unavailable" : ""}`}>
                  <strong>
                    {picks.loading
                      ? "…"
                      : picks.footballSummary
                        ? pickRecord(picks.footballSummary)
                        : "—"}
                  </strong>
                  <span>Football Picks record</span>
                  <small>CURRENT SEASON</small>
                </article>
              </div>

              {yourHqError ? (
                <p className="hq-card__error" role="status">
                  Some HQ stats could not sync. Your saved activity is unchanged.
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
