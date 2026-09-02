import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import type { FootballTeam } from "../profile/profilePreferencesRepository";
import { DailyChallengeStandings } from "../play/DailyChallengeStandings";
import { playGameDefinition, type PlayGameId } from "../play/playRegistry";
import { useTodayChallengeOverview } from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { FootballGamesEarlyAccessBanner } from "./FootballGamesEarlyAccessBanner";
import { FootballTeamHelmet } from "./FootballHeader";

const FOOTBALL_GAME_ORDER = [
  "hit-the-number",
  "find-leader",
  "wavelength",
  "blind-resume",
  "blind-rank",
  "keep-cut",
] as const satisfies readonly PlayGameId[];

type FootballLibraryGameId = (typeof FOOTBALL_GAME_ORDER)[number];

const GAME_KICKERS: Record<FootballLibraryGameId, string> = {
  "hit-the-number": "BUILD TO THE TARGET",
  "find-leader": "KNOW THE RECORDS",
  wavelength: "READ THE SCALE",
  "blind-resume": "NO NAMES. JUST THE RESUME.",
  "blind-rank": "BLIND RANKING",
  "keep-cut": "ROSTER DECISIONS",
};

const GAME_LIBRARY_DESCRIPTIONS: Record<FootballLibraryGameId, string> = {
  "hit-the-number": "Build a football board and chase the NFL or CFB target without going over.",
  "find-leader": "Eliminate the decoys and leave the hidden NFL or CFB stat leader standing.",
  wavelength: "Find the hidden 1–100 football number through four adaptive clues.",
  "blind-resume": "Pick the stronger football resume as the evidence is revealed.",
  "blind-rank": "Rank five mystery football subjects before you see who comes next.",
  "keep-cut": "Reveal eight football subjects and lock four keeps and four cuts.",
};

const GAME_META: Record<FootballLibraryGameId, string> = {
  "hit-the-number": "NFL + CFB · BUILD",
  "find-leader": "NFL + CFB · ELIMINATION",
  wavelength: "NFL + CFB · SCALE",
  "blind-resume": "NFL + CFB · REVEALS",
  "blind-rank": "NFL + CFB · RANKING",
  "keep-cut": "NFL + CFB · FRONT OFFICE",
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

function FootballGameLibraryMark({ gameId }: { gameId: FootballLibraryGameId }) {
  if (gameId === "hit-the-number") {
    return (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" aria-hidden="true">
        <rect x="6" y="7" width="36" height="34" rx="7" stroke="currentColor" strokeWidth="2" />
        <path d="M7 16h34" stroke="currentColor" strokeWidth="2" />
        <text x="24" y="32" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="900">32</text>
        <circle cx="12" cy="11.5" r="1.5" fill="currentColor" />
        <circle cx="17" cy="11.5" r="1.5" fill="currentColor" opacity=".6" />
      </svg>
    );
  }

  if (gameId === "find-leader") {
    return (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" aria-hidden="true">
        <path d="M10 37h28M12 31h8M12 24h14M12 17h20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="35" cy="30" r="8" stroke="currentColor" strokeWidth="2" />
        <text x="35" y="34" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="900">#1</text>
      </svg>
    );
  }

  if (gameId === "wavelength") {
    return (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" aria-hidden="true">
        <path d="M7 30h34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M9 26v8M17 27v6M24 25v10M31 27v6M39 26v8" stroke="currentColor" strokeWidth="1.5" opacity=".75" />
        <circle cx="27" cy="30" r="5" fill="currentColor" />
        <path d="M27 12v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="m23 17 4 4 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (gameId === "blind-resume") {
    return (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" aria-hidden="true">
        <path d="M11 6h21l7 7v29H11z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 6v8h7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 21h17M16 27h13M16 33h16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="34.5" cy="34.5" r="7.5" fill="currentColor" />
        <text x="34.5" y="38" textAnchor="middle" fill="var(--football-card)" fontSize="10" fontWeight="950">?</text>
      </svg>
    );
  }

  if (gameId === "blind-rank") {
    return (
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((rank) => {
          const x = 5 + ((rank - 1) * 8);
          return (
            <g key={rank}>
              <rect x={x} y={10 + ((rank - 1) % 2) * 5} width="6" height={28 - ((rank - 1) % 2) * 5} rx="2" stroke="currentColor" strokeWidth="1.4" />
              <text x={x + 3} y="43" textAnchor="middle" fill="currentColor" fontSize="6.5" fontWeight="900">{rank}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" width="42" height="42" fill="none" aria-hidden="true">
      <rect x="5" y="7" width="38" height="34" rx="8" stroke="currentColor" strokeWidth="2" />
      <path d="M24 8v32" stroke="currentColor" strokeWidth="2" />
      <text x="14.5" y="23" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="950">KEEP</text>
      <text x="33.5" y="23" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="950">CUT</text>
      <text x="14.5" y="34" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="950">4</text>
      <text x="33.5" y="34" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="950">4</text>
    </svg>
  );
}

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

function FootballEntryTransition({ onComplete }: { onComplete: () => void }) {
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
        onEnded={onComplete}
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
    () => FOOTBALL_GAME_ORDER.map((id) => ({
      id,
      definition: playGameDefinition(id, "football"),
    })),
    [],
  );

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
      {showTransition ? (
        <FootballEntryTransition
          onComplete={() => navigate("/football", { replace: true, state: null })}
        />
      ) : null}

      {!showTransition ? <FootballGamesEarlyAccessBanner /> : null}

      <section className="football-daily-hq" aria-labelledby="football-daily-title">
        <div className="football-daily-hq__heading">
          <div>
            <p className="eyebrow">TODAY’S CHALLENGE</p>
            <h1 id="football-daily-title">{dailyTitle}</h1>
          </div>
          <span className="football-daily-hq__badge"><b>DAILY</b><small>24H</small></span>
        </div>

        <div className="football-daily-hq__tabs" role="tablist" aria-label="Today’s Challenge view">
          <button type="button" role="tab" aria-selected={dailyTab === "game"} className={dailyTab === "game" ? "is-active" : ""} onClick={() => setDailyTab("game")}>GAME</button>
          <button type="button" role="tab" aria-selected={dailyTab === "leaderboard"} className={dailyTab === "leaderboard" ? "is-active" : ""} onClick={() => setDailyTab("leaderboard")}>LEADERBOARD</button>
        </div>

        {dailyTab === "game" ? (
          <div className="football-daily-hq__game">
            <div className="football-daily-hq__game-copy">
              <strong>One official board. Same challenge for everyone.</strong>
              <p>NFL and college football both live here. Your first run is the one that counts.</p>
            </div>
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
          <div>
            <p className="eyebrow">FOOTBALL HQ</p>
            <h2 id="football-all-games-title">ALL GAMES</h2>
          </div>
          <span>6 GAMES</span>
        </div>
        <div className="football-room-game-grid" aria-label="Football games">
          {footballGames.map(({ id, definition: game }) => (
            <button className="football-room-preview" type="button" key={game.route} onClick={() => navigate(game.route)}>
              <span className="football-room-preview__mark" aria-hidden="true">
                <FootballGameLibraryMark gameId={id} />
              </span>
              <div className="football-room-preview__copy">
                <small className="football-room-preview__kicker">{GAME_KICKERS[id]}</small>
                <strong>{game.id === "blind-rank" ? "BLIND RANK FIVE" : game.title.toUpperCase()}</strong>
                <p>{GAME_LIBRARY_DESCRIPTIONS[id]}</p>
                <div className="football-room-preview__meta">
                  <span>{GAME_META[id]}</span>
                  <em>PLAY →</em>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
