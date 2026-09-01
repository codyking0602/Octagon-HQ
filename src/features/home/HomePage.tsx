import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  eventPicksLocked,
  groupRankLabel,
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
import { allTime } from "../rankings/rankingModel";
import { FootballHq } from "./FootballHq";
import { dailyRankingSpotlight } from "./homeSpotlightModel";
import { RankingSpotlightCard } from "./RankingSpotlightCard";
import { ShanesWatchlistCard } from "./ShanesWatchlistCard";
import "../../styles/home-football-hq.css";
import "../../styles/home-ufc-hq.css";

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
  const currentStreak = ufcDailyOverview.streak.currentStreak;
  const currentEvent = picks.event;
  const recordSeason = currentEvent?.season ?? picks.history?.season ?? new Date().getFullYear();
  const picksProgress = pickProgress(currentEvent, picks.selections);
  const picksPercent = picksProgress.total
    ? Math.round((picksProgress.completed / picksProgress.total) * 100)
    : 0;
  const picksLocked = currentEvent ? eventPicksLocked(currentEvent) : false;
  const picksRemaining = Math.max(0, picksProgress.total - picksProgress.completed);
  const picksStatus = !signedIn
    ? "SIGN IN TO PLAY"
    : picks.loading && !currentEvent
      ? "LOADING"
      : picks.error && !currentEvent
        ? "UNAVAILABLE"
        : picksLocked
          ? "PICKS LOCKED"
          : picksProgress.total > 0 && picksRemaining === 0
            ? "PICKS READY"
            : picksProgress.total > 0
              ? `${picksRemaining} PICK${picksRemaining === 1 ? "" : "S"} LEFT`
              : "WAITING FOR CARD";
  const ufcStandings = picks.history?.seasonStandings ?? [];
  const currentUfcStanding = ufcStandings.find((standing) => standing.isCurrentUser) ?? null;
  const currentUfcRank = currentUfcStanding
    ? groupRankLabel(currentUfcStanding.rank, ufcStandings)
    : "";

  return (
    <div className="page home-page">
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
        className="home-section home-section--whats-new"
        data-testid="home-section"
        data-home-section="whats-new"
        aria-label="What’s New"
      >
        <WhatsNewPreview />
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
        className="home-section home-sport-hq home-sport-hq--ufc home-section--ufc-hq"
        data-testid="home-section"
        data-home-section="ufc-hq"
        aria-label="UFC HQ"
      >
        <header className="home-sport-hq__heading">
          <div>
            <p className="eyebrow">UFC HQ</p>
            <h2>Fight week</h2>
          </div>
          <small>PICKS · RANKINGS · CONTENDERS</small>
        </header>

        <section className="surface-card home-event-card home-event-card--compact" aria-label="UFC Picks and standing">
          <div className="home-event-card__topline">
            <p className="eyebrow">UFC PICKS</p>
            <span>
              {currentEvent
                ? picksLocked ? "LOCKED" : "ACTIVE"
                : picks.loading ? "LOADING" : picks.error ? "UNAVAILABLE" : "WAITING"}
            </span>
          </div>
          <div className="home-event-card__picks-grid">
            <div className="picks-progress" aria-label={`${picksProgress.completed} of ${picksProgress.total} picks completed`}>
              <div>
                <span>YOUR PICKS</span>
                <b>{signedIn && currentEvent ? `${picksProgress.completed} OF ${picksProgress.total}` : "—"}</b>
              </div>
              <div className="picks-progress__track" aria-hidden="true"><span style={{ width: `${picksPercent}%` }} /></div>
              <small className="home-event-card__picks-status">{picksStatus}</small>
            </div>
            <div className="home-event-card__standing" aria-label="UFC Picks season standing">
              <span>{recordSeason} STANDING</span>
              <b>{signedIn && currentUfcRank ? `#${currentUfcRank} OF ${ufcStandings.length}` : "—"}</b>
              <small>
                {!signedIn
                  ? "SIGN IN TO TRACK"
                  : currentUfcStanding
                    ? `${currentUfcStanding.totalPoints} PTS`
                    : "NO STANDING YET"}
              </small>
            </div>
          </div>
          {currentEvent ? (
            identity.profile ? (
              <Link className="secondary-action" to="/picks">
                {picksProgress.completed === picksProgress.total ? "REVIEW PICKS" : "MAKE PICKS"} →
              </Link>
            ) : (
              <button className="secondary-action" type="button" onClick={identity.openDialog}>SIGN IN TO MAKE PICKS →</button>
            )
          ) : null}
        </section>

        {spotlight ? <RankingSpotlightCard fighter={spotlight} /> : null}
        <ShanesWatchlistCard />
      </section>

      <FootballHq
        event={picks.footballEvent}
        selections={picks.footballSelections}
        history={picks.footballHistory}
        summary={picks.footballSummary}
        loading={picks.loading}
        error={picks.footballHomeError}
        signedIn={signedIn}
      />
    </div>
  );
}
