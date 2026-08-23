import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import type { FootballTeam } from "../profile/profilePreferencesRepository";
import { DailyChallengeStandings } from "../play/DailyChallengeStandings";
import { playGameDefinition, type PlayGameId } from "../play/playRegistry";
import { useTodayChallengeOverview } from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { FootballTeamHelmet } from "./FootballHeader";

const FOOTBALL_GAME_ORDER: readonly PlayGameId[] = [
  "hit-the-number",
  "find-leader",
  "wavelength",
  "blind-resume",
  "blind-rank",
  "keep-cut",
];

const GAME_KICKERS: Partial<Record<PlayGameId, string>> = {
  "hit-the-number": "BUILD TO THE TARGET",
  "find-leader": "KNOW THE RECORDS",
  wavelength: "READ THE SCALE",
  "blind-resume": "NO NAMES. JUST THE RÉSUMÉ.",
  "blind-rank": "BLIND RANKING",
  "keep-cut": "ROSTER DECISIONS",
};

const GAME_MARKS: Partial<Record<PlayGameId, string>> = {
  "hit-the-number": "#",
  "find-leader": "↑",
  wavelength: "~",
  "blind-resume": "?",
  "blind-rank": "5",
  "keep-cut": "4/4",
};

const DAILY_GAME_LABELS: Record<string, string> = {
  find_leader: "Find the Leader",
  wavelength: "Wavelength",
  blind_resume: "Blind Resume",
  blind_rank_5: "Blind Rank Five",
  keep_4_cut_4: "Keep Four, Cut Four",
  hit_the_number: "Hit the Number",
};

const TEAM_COPY: Record<FootballTeam, { title: string; subtitle: string }> = {
  cowboys: { title: "Dallas Cowboys", subtitle: "NAVY · SILVER · WHITE" },
  longhorns: { title: "Texas Longhorns", subtitle: "BURNT ORANGE · CREAM" },
};

function FootballEntryGate({ onChoose, saving }: {
  onChoose: (team: FootballTeam) => void;
  saving: boolean;
}) {
  return (
    <section className="football-entry-gate" aria-labelledby="football-entry-title">
      <p className="eyebrow">WELCOME TO FOOTBALL HQ</p>
      <h1 id="football-entry-title">Pick your side.</h1>
      <p>Your choice personalizes Football HQ and follows your profile across devices.</p>
      <div className="football-entry-gate__choices">
        {(["cowboys", "longhorns"] as const).map((team) => (
          <button key={team} type="button" disabled={saving} onClick={() => onChoose(team)}>
            <FootballTeamHelmet team={team} />
            <strong>{TEAM_COPY[team].title}</strong>
            <small>{TEAM_COPY[team].subtitle}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function FootballEntryTransition() {
  return (
    <div className="football-entry-transition" role="presentation">
      <video
        className="football-entry-transition__video"
        src="/assets/football/vince-young-championship-run.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
    </div>
  );
}

export default function FootballBackRoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? "";
  const {
    footballTeam,
    loading: preferencesLoading,
    savingFootballTeam,
    setFootballTeam,
  } = useProfilePreferences();
  const [dailyTab, setDailyTab] = useState<"game" | "leaderboard">("game");
  const entryRequested = Boolean((location.state as { footballEntry?: boolean } | null)?.footballEntry);
  const showTransition = entryRequested && Boolean(footballTeam) && !preferencesLoading;
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
  const footballGames = useMemo(
    () => FOOTBALL_GAME_ORDER.map((id) => playGameDefinition(id, "football")),
    [],
  );

  useEffect(() => {
    if (!showTransition) return undefined;
    const timer = window.setTimeout(() => {
      navigate("/football", { replace: true, state: null });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [navigate, showTransition]);

  if (preferencesLoading && !footballTeam) {
    return <div className="page football-room-page"><p className="football-room-loading">Loading Football HQ…</p></div>;
  }

  if (!footballTeam) {
    return (
      <div className="page football-room-page">
        <FootballEntryGate
          saving={savingFootballTeam}
          onChoose={(team) => void setFootballTeam(team)}
        />
      </div>
    );
  }

  const dailyTitle = runtime.projection
    ? DAILY_GAME_LABELS[runtime.projection.gameType] ?? "Today’s Challenge"
    : "Today’s Challenge";
  const leaderboard = overview.leaderboard;

  return (
    <div className={`page football-room-page football-room-page--${footballTeam}`}>
      {showTransition ? <FootballEntryTransition /> : null}

      <section className="football-daily-hq" aria-labelledby="football-daily-title">
        <div className="football-daily-hq__heading">
          <div>
            <p className="eyebrow">TODAY’S CHALLENGE</p>
            <h1 id="football-daily-title">{dailyTitle}</h1>
          </div>
          <span>24H</span>
        </div>

        <div className="football-daily-hq__tabs" role="tablist" aria-label="Today’s Challenge view">
          <button type="button" role="tab" aria-selected={dailyTab === "game"} className={dailyTab === "game" ? "is-active" : ""} onClick={() => setDailyTab("game")}>GAME</button>
          <button type="button" role="tab" aria-selected={dailyTab === "leaderboard"} className={dailyTab === "leaderboard" ? "is-active" : ""} onClick={() => setDailyTab("leaderboard")}>LEADERBOARD</button>
        </div>

        {dailyTab === "game" ? (
          <div className="football-daily-hq__game">
            <p>One official football board for everyone, built from the shared daily-challenge platform with NFL and college football content.</p>
            <button className="primary-action" type="button" onClick={() => navigate("/football/today")}>PLAY TODAY →</button>
          </div>
        ) : (
          <div className="football-daily-hq__leaderboard">
            {overview.leaderboardLoading ? <p>Loading today’s leaderboard…</p> : !leaderboard?.unlocked ? (
              <p>Finish today’s challenge to unlock the leaderboard.</p>
            ) : leaderboard.entries.length ? (
              <ol>
                {leaderboard.entries.map((entry) => (
                  <li key={entry.profileId} className={entry.isCurrentUser ? "is-current" : ""}>
                    <b>#{entry.rank}</b>
                    <span>{entry.displayName}</span>
                    <strong>{entry.normalizedScore}</strong>
                  </li>
                ))}
              </ol>
            ) : <p>No completed scores yet today.</p>}
          </div>
        )}
      </section>

      <DailyChallengeStandings
        standings={overview.standings}
        loading={overview.standingsLoading}
        error={overview.error instanceof Error ? overview.error : null}
        onRefresh={() => void overview.refresh()}
      />

      <ChallengeCenter sport="football" />

      <section className="football-all-games" aria-labelledby="football-all-games-title">
        <div className="football-all-games__heading">
          <p className="eyebrow">FOOTBALL HQ</p>
          <h2 id="football-all-games-title">ALL GAMES</h2>
        </div>
        <div className="football-room-game-grid" aria-label="Football games">
          {footballGames.map((game) => (
            <button className="football-room-preview" type="button" key={game.route} onClick={() => navigate(game.route)}>
              <span className="football-room-preview__mark" aria-hidden="true">{GAME_MARKS[game.id]}</span>
              <div>
                <small>{GAME_KICKERS[game.id]}</small>
                <strong>{game.id === "blind-rank" ? "BLIND RANK FIVE" : game.title.toUpperCase()}</strong>
                <p>{game.description}</p>
                <em>OPEN GAME →</em>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
