import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { DailyChallengeStandings } from "../play/DailyChallengeStandings";
import {
  playGameDefinition,
  type PlayGameId,
} from "../play/playRegistry";
import type { DailyGameType } from "../play/todaysChallengeAdapters";
import { useTodayChallengeOverview } from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";

const FOOTBALL_GAME_ORDER: PlayGameId[] = [
  "hit-the-number",
  "find-leader",
  "wavelength",
  "blind-resume",
  "blind-rank",
  "keep-cut",
];

const DAILY_GAME_IDS: Record<DailyGameType, PlayGameId> = {
  hit_the_number: "hit-the-number",
  find_leader: "find-leader",
  wavelength: "wavelength",
  blind_resume: "blind-resume",
  blind_rank_5: "blind-rank",
  keep_4_cut_4: "keep-cut",
};

type HeroTab = "game" | "leaderboard";

export default function FootballHomePage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const { footballTeam, loading: preferencesLoading } = useProfilePreferences();
  const profileId = identity.profile?.id ?? "";
  const [heroTab, setHeroTab] = useState<HeroTab>("game");
  const runtime = useTodayChallengeRuntime({
    profileId,
    enabled: Boolean(profileId),
    sport: "football",
  });
  const overview = useTodayChallengeOverview({
    profileId,
    enabled: Boolean(profileId),
    projection: runtime.projection,
    sport: "football",
  });
  const games = useMemo(
    () => FOOTBALL_GAME_ORDER.map((gameId) => playGameDefinition(gameId, "football")),
    [],
  );
  const dailyGame = runtime.projection
    ? playGameDefinition(DAILY_GAME_IDS[runtime.projection.gameType], "football")
    : null;
  const completed = Boolean(runtime.projection?.officialAttempt);
  const overviewError = overview.error instanceof Error ? overview.error : null;

  useEffect(() => {
    if (!preferencesLoading && !footballTeam) {
      navigate("/football/entry", { replace: true });
    }
  }, [footballTeam, navigate, preferencesLoading]);

  return (
    <div className="page football-home-page">
      <section className="football-today" aria-label="Football Today’s Challenge">
        <div className="football-today__tabs" role="tablist" aria-label="Today’s Challenge views">
          <button
            type="button"
            role="tab"
            aria-selected={heroTab === "game"}
            className={heroTab === "game" ? "is-active" : ""}
            onClick={() => setHeroTab("game")}
          >
            GAME
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={heroTab === "leaderboard"}
            className={heroTab === "leaderboard" ? "is-active" : ""}
            onClick={() => setHeroTab("leaderboard")}
          >
            LEADERBOARD
          </button>
        </div>

        {heroTab === "game" ? (
          <div className="football-today__hero" role="tabpanel">
            <div className="football-today__copy">
              <p className="eyebrow">TODAY’S CHALLENGE</p>
              <h1>{dailyGame?.title ?? (runtime.loading ? "Loading today’s game…" : "Today’s game")}</h1>
              <p>{dailyGame?.description ?? "One shared Football board for everyone. One score out of 100."}</p>
              {runtime.projection ? (
                <div className="football-today__meta">
                  <span>{runtime.projection.centralDay}</span>
                  <span>{completed ? `${runtime.projection.officialAttempt!.normalizedScore}/100 COMPLETE` : "READY TO PLAY"}</span>
                </div>
              ) : null}
            </div>
            <button
              className="football-primary-action"
              type="button"
              disabled={!runtime.projection}
              onClick={() => navigate("/football/today")}
            >
              {completed ? "VIEW TODAY’S RESULT" : "PLAY TODAY’S CHALLENGE"}
            </button>
          </div>
        ) : (
          <div className="football-today__leaderboard" role="tabpanel">
            <div className="football-today__leaderboard-heading">
              <div>
                <p className="eyebrow">TODAY’S BOARD</p>
                <h2>{dailyGame?.title ?? "Leaderboard"}</h2>
              </div>
              <small>{overview.leaderboard?.playerCount ?? 0} PLAYED</small>
            </div>
            {!completed ? (
              <p className="football-today__locked">Finish today’s game to unlock the leaderboard.</p>
            ) : overview.leaderboardLoading ? (
              <p className="football-today__locked">Loading leaderboard…</p>
            ) : overview.leaderboard?.unlocked && overview.leaderboard.entries.length ? (
              <div className="football-today__leaderboard-list">
                {overview.leaderboard.entries.slice(0, 8).map((entry) => (
                  <div className={entry.isCurrentUser ? "is-current" : ""} key={entry.profileId}>
                    <b>#{entry.rank}</b>
                    <span>{entry.displayName}</span>
                    <strong>{entry.normalizedScore}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="football-today__locked">No completed scores yet.</p>
            )}
          </div>
        )}
      </section>

      <DailyChallengeStandings
        standings={overview.standings}
        loading={overview.standingsLoading}
        error={overviewError}
        onRefresh={() => void overview.refresh()}
      />

      <ChallengeCenter sport="football" />

      <section className="football-library" aria-labelledby="football-library-title">
        <header>
          <p className="eyebrow">ALL GAMES</p>
          <h2 id="football-library-title">Football game room</h2>
          <p>NFL and college football games using the same account, challenges, and scoring platform.</p>
        </header>
        <div className="football-library__grid">
          {games.map((game, index) => (
            <button
              className="football-library-card"
              type="button"
              key={game.id}
              onClick={() => navigate(game.route)}
            >
              <span className="football-library-card__number">0{index + 1}</span>
              <span className="football-library-card__icon" aria-hidden="true">{game.icon}</span>
              <strong>{game.title}</strong>
              <small>{game.description}</small>
              <em>PLAY →</em>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
