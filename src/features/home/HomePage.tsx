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
import type {
  TodayChallengeLeaderboard,
  TodayChallengeProjection,
} from "../play/todayChallengeRepository";
import { todayChallengeAdapter } from "../play/todaysChallengeAdapters";
import { useTodayChallengeOverview } from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { WhatsNewPreview } from "../whats-new/WhatsNewPreview";
import { useWhatsNew } from "../whats-new/WhatsNewProvider";
import { allTime } from "../rankings/rankingModel";
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

function todayRank(leaderboard: TodayChallengeLeaderboard | null) {
  if (!leaderboard?.unlocked) return null;
  return leaderboard.entries.find((entry) => entry.isCurrentUser)?.rank ?? null;
}

function TodayChallengeCard({
  sport,
  title,
  to,
  signedIn,
  loading,
  error,
  projection,
  leaderboard,
}: {
  sport: "ufc" | "football";
  title: string;
  to: string;
  signedIn: boolean;
  loading: boolean;
  error: string;
  projection: TodayChallengeProjection | null;
  leaderboard: TodayChallengeLeaderboard | null;
}) {
  const attempt = projection?.officialAttempt ?? null;
  const rank = todayRank(leaderboard);
  const status = !signedIn
    ? "SIGN IN"
    : loading && !projection
      ? "LOADING"
      : error && !projection
        ? "UNAVAILABLE"
        : attempt
          ? "COMPLETED"
          : (projection?.progressRevision ?? 0) > 0
            ? "IN PROGRESS"
            : projection
              ? "NOT PLAYED"
              : "UNAVAILABLE";
  const sportLabel = sport === "ufc" ? "UFC" : "FOOTBALL";

  return (
    <Link
      className="home-challenge-card"
      data-sport={sport}
      to={to}
      aria-label={`Open ${sportLabel} Today’s Challenge`}
    >
      <div className="home-challenge-card__topline">
        <span>{sportLabel}</span>
        <small>{status}</small>
      </div>
      <div className="home-challenge-card__copy">
        <h3>{title}</h3>
        {!signedIn ? (
          <p>Sign in to track today’s score and standing.</p>
        ) : attempt ? (
          <p>{rank ? `#${rank} today` : "Official score locked"}</p>
        ) : status === "IN PROGRESS" ? (
          <p>Pick up where you left off.</p>
        ) : status === "NOT PLAYED" ? (
          <p>Ready when you are.</p>
        ) : status === "LOADING" ? (
          <p>Checking today’s game.</p>
        ) : (
          <p>{error || "Today’s challenge is unavailable."}</p>
        )}
      </div>
      <div className="home-challenge-card__result">
        {attempt ? (
          <strong>{attempt.normalizedScore}<small>/100</small></strong>
        ) : (
          <strong>{status}</strong>
        )}
        <span>OPEN <b aria-hidden="true">→</b></span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const identity = useIdentity();
  const picks = usePicks();
  const challengeState = usePlayChallenges();
  const whatsNew = useWhatsNew();
  const profileId = identity.profile?.id ?? "signed-out";
  const signedIn = Boolean(identity.profile?.id);
  const ufcDailyRuntime = useTodayChallengeRuntime({ profileId, enabled: signedIn, sport: "ufc" });
  const ufcDailyOverview = useTodayChallengeOverview({
    profileId,
    enabled: signedIn,
    projection: ufcDailyRuntime.projection,
    sport: "ufc",
  });
  const footballDailyRuntime = useTodayChallengeRuntime({
    profileId,
    enabled: signedIn,
    sport: "football",
  });
  const footballDailyOverview = useTodayChallengeOverview({
    profileId,
    enabled: signedIn,
    projection: footballDailyRuntime.projection,
    sport: "football",
  });
  const ufcDailyAdapter = todayChallengeAdapter(ufcDailyRuntime.projection?.gameType);
  const footballDailyAdapter = todayChallengeAdapter(footballDailyRuntime.projection?.gameType);
  const spotlight = dailyRankingSpotlight(allTime, new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()));
  const ufcDailyLoading = ufcDailyRuntime.loading || ufcDailyOverview.loading;
  const footballDailyLoading = footballDailyRuntime.loading || footballDailyOverview.loading;
  const ufcDailyError = readableError(ufcDailyRuntime.error) || readableError(ufcDailyOverview.error);
  const footballDailyError = readableError(footballDailyRuntime.error) || readableError(footballDailyOverview.error);
  const playedToday = Boolean(ufcDailyRuntime.projection?.officialAttempt);
  const currentStreak = ufcDailyOverview.streak.currentStreak;
  const openChallenges = identity.profile
    ? meaningfulOpenChallenges(challengeState.challenges, identity.profile.id)
    : [];
  const currentEvent = picks.event;
  const recordSeason = currentEvent?.season ?? new Date().getFullYear();
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
        ufcDailyLoading
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
        dailyChallengeTitle: ufcDailyAdapter?.title,
        dailyChallengeRoute: ufcDailyAdapter?.dailyRoute,
        challengeAction: directChallengeAction,
        whatsNewItems: whatsNew.activeItems,
      });
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
        <div className="section-heading home-challenges__heading">
          <div>
            <p className="eyebrow">TODAY</p>
            <h2>Today’s Challenges</h2>
          </div>
        </div>
        <div className="home-challenges__grid">
          <TodayChallengeCard
            sport="ufc"
            title={ufcDailyAdapter?.title ?? "Today’s Challenge"}
            to={ufcDailyAdapter?.dailyRoute ?? "/play"}
            signedIn={signedIn}
            loading={ufcDailyLoading}
            error={ufcDailyError}
            projection={ufcDailyRuntime.projection}
            leaderboard={ufcDailyOverview.leaderboard}
          />
          <TodayChallengeCard
            sport="football"
            title={footballDailyAdapter?.title ?? "Today’s Challenge"}
            to="/football/today"
            signedIn={signedIn}
            loading={footballDailyLoading}
            error={footballDailyError}
            projection={footballDailyRuntime.projection}
            leaderboard={footballDailyOverview.leaderboard}
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
            <div className="hq-card__grid">
              <article className={`hq-stat${ufcDailyError ? " is-unavailable" : ""}`}>
                <strong>{ufcDailyLoading ? "…" : ufcDailyError ? "—" : currentStreak}</strong>
                <span>Daily streak</span>
                <small>{ufcDailyError ? "UNAVAILABLE" : "UFC TODAY’S CHALLENGE"}</small>
              </article>

              <article className={`hq-stat${picks.error ? " is-unavailable" : ""}`}>
                <strong>{picks.loading ? "…" : picks.error ? "—" : pickRecord(picks.summary)}</strong>
                <span>UFC Picks record</span>
                <small>
                  {picks.error
                    ? "UNAVAILABLE"
                    : `${recordSeason} SEASON${picks.summary.pending ? ` · ${picks.summary.pending} PENDING` : ""}`}
                </small>
              </article>

              <article className={`hq-stat${picks.footballSummaryError ? " is-unavailable" : ""}`}>
                <strong>{picks.loading ? "…" : picks.footballSummaryError ? "—" : pickRecord(picks.footballSummary)}</strong>
                <span>Football Picks record</span>
                <small>
                  {picks.footballSummaryError
                    ? "UNAVAILABLE"
                    : `${recordSeason} SEASON${picks.footballSummary.pending ? ` · ${picks.footballSummary.pending} PENDING` : ""}`}
                </small>
              </article>
            </div>
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
