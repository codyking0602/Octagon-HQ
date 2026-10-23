import { Link, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { DailyTwoGameStatus } from "../play/DailyTwoGameStatus";
import { OfficialAverageFanDailyView } from "../play/OfficialAverageFanDailyView";
import { OfficialBarTriviaDailyView } from "../play/OfficialBarTriviaDailyView";
import { OfficialMillionaireDailyView } from "../play/OfficialMillionaireDailyView";
import { OfficialSportsFeudDailyView } from "../play/OfficialSportsFeudDailyView";
import { OfficialWhoAmIDailyView } from "../play/OfficialWhoAmIDailyView";
import TodayChallengeHub from "../play/TodayChallengeHub";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import { NBA_DAILY_GAME_LABELS, nbaCanAccessReleasedGames, nbaCentralDay, nbaRegularSeasonDaily } from "./nbaDailySchedule";
import { NbaOfficialDailyGameplay } from "./NbaOfficialDailyGameplay";
import "./NbaOfficialDailyGameplay.css";

type Action = Record<string, unknown>;
function NbaDailyGate() {
  return <div className="page nba-official-daily-page">
    <section className="nba-official-daily-page__locked">
      <p className="eyebrow">NBA DAILY · LAUNCH PREPARATION</p>
      <h1>Official Daily is not open yet.</h1>
      <p>Owner previews are available from NBA Play, but preview results do not count toward standings.</p>
      <Link to="/nba">BACK TO NBA PLAY →</Link>
    </section>
  </div>;
}
function OfficialNbaGame({
  projection, busy, onAdvance, onExit, onRetry, onRefresh,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Action) => void;
  onExit: () => void;
  onRetry: () => void;
  onRefresh: () => void;
}) {
  switch (projection.gameType) {
    case "average_fan":
      return <OfficialAverageFanDailyView projection={projection} busy={busy}
        onAdvance={onAdvance} onExit={onExit} />;
    case "sports_feud":
      return <OfficialSportsFeudDailyView projection={projection} busy={busy}
        onAdvance={onAdvance} onExit={onExit} onRetryResult={onRetry} onRefreshSaved={onRefresh} />;
    case "millionaire":
      return <OfficialMillionaireDailyView projection={projection} busy={busy}
        onAdvance={onAdvance} onExit={onExit} />;
    case "who_am_i":
      return <OfficialWhoAmIDailyView projection={projection} busy={busy} onAdvance={onAdvance} />;
    case "bar_trivia":
      return <OfficialBarTriviaDailyView projection={projection} busy={busy}
        onAdvance={onAdvance} onExit={onExit} />;
    case "find_leader":
    case "wavelength":
    case "hit_the_number":
    case "higher_lower":
      return <NbaOfficialDailyGameplay projection={projection} busy={busy}
        onAdvance={onAdvance} onBack={onExit} />;
    default:
      return <section className="nba-official-daily-page__error" role="alert">
        This official NBA Daily game is not available.
      </section>;
  }
}

/** One signed-in, server-authoritative NBA board. Owner rehearsals retain separate unranked routes. */
export default function NbaOfficialTodayPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const day = nbaCentralDay();
  const released = nbaCanAccessReleasedGames(day) && nbaRegularSeasonDaily(day) !== null;
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const runtime = useTodayChallengeRuntime({
    profileId: identity.profile?.id ?? "signed-out",
    sport: "nba",
    enabled: released && signedIn,
  });
  if (!released) return <NbaDailyGate />;
  if (!signedIn) return <div className="page nba-official-daily-page">
    <section className="nba-official-daily-page__locked">
      <h1>Sign in to play NBA Daily.</h1>
      <p>Your official result will follow your HQ profile across devices.</p>
      <button type="button" onClick={identity.openDialog}>SIGN IN</button>
    </section>
  </div>;
  if (!runtime.projection) return <div className="page nba-official-daily-page">
    <section className="nba-official-daily-page__loading" role="status">
      <h1>{runtime.loading ? "Loading your official NBA board…" : "Your NBA board needs a refresh."}</h1>
      {runtime.error ? <p>{runtime.error instanceof Error ? runtime.error.message : "Unable to load the official game."}</p> : null}
      <button type="button" onClick={() => void runtime.refresh()}>RETRY</button>
    </section>
  </div>;
  const projection = runtime.projection;
  const onAdvance = (action: Action) => { void runtime.advance(action); };
  const onExit = () => navigate("/nba");
  return <main className="page nba-official-daily-page official-daily-page" data-sport="nba" data-testid="nba-official-daily">
    <header className="nba-official-daily-page__header">
      <div>
        <p>NBA DAILY · OFFICIAL GAME</p>
        <h1>{NBA_DAILY_GAME_LABELS[projection.gameType as keyof typeof NBA_DAILY_GAME_LABELS] ?? "NBA CHALLENGE"}</h1>
        <small>{projection.centralDay} · SAME BOARD FOR EVERYONE</small>
      </div>
      <button type="button" onClick={onExit}>NBA PLAY ↗</button>
    </header>
    {runtime.error ? <section className="nba-official-daily-page__error" role="status">
      <strong>Progress needs to sync</strong>
      <p>{runtime.error instanceof Error ? runtime.error.message : "Your saved progress could not be refreshed."}</p>
      <button type="button" onClick={() => void runtime.recheckSaved()}>RESTORE SAVED GAME</button>
    </section> : null}
    <DailyTwoGameStatus projection={projection} busy={runtime.busy} onAdvance={onAdvance} />
    {projection.officialAttempt ? <section className="nba-official-daily-page__score" aria-label="Official NBA Daily score">
      <small>YOUR SAVED OFFICIAL SCORE</small>
      <div><strong>{projection.officialAttempt.normalizedScore}</strong> / 100</div>
      <Link to="/nba/standings">TODAY'S LEADERBOARD ↗</Link>
    </section> : null}
    <OfficialNbaGame projection={projection} busy={runtime.busy} onAdvance={onAdvance}
      onExit={onExit} onRetry={() => void runtime.retryPending()}
      onRefresh={() => void runtime.recheckSaved()} />
  </main>;
}

export function NbaDailyStandingsPage() {
  const day = nbaCentralDay();
  if (!nbaCanAccessReleasedGames(day) || !nbaRegularSeasonDaily(day)) return <NbaDailyGate />;
  return <div className="page nba-official-daily-page">
    <TodayChallengeHub sport="nba" />
  </div>;
}
