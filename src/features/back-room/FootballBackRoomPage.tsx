import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { DailyChallengeStandings } from "../play/DailyChallengeStandings";
import { PlayLandingGameLibrary, PlayLandingHeader } from "../play/PlayLandingPresentation";
import { useTodayChallengeOverview } from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { FootballGamesEarlyAccessBanner } from "./FootballGamesEarlyAccessBanner";

const DAILY_GAME_LABELS: Record<string, string> = {
  find_leader: "Find the Leader",
  wavelength: "Wavelength",
  blind_resume: "Blind Resume",
  blind_rank_5: "Blind Rank Five",
  keep_4_cut_4: "Keep Four, Cut Four",
  hit_the_number: "Hit the Number",
};

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
  const [dailyTab, setDailyTab] = useState<"game" | "leaderboard">("game");
  const entryRequested = Boolean((location.state as { footballEntry?: boolean } | null)?.footballEntry);
  const showTransition = entryRequested;
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
  const dailyTitle = runtime.projection
    ? DAILY_GAME_LABELS[runtime.projection.gameType] ?? "Today’s Challenge"
    : "Today’s Challenge";
  const leaderboard = overview.leaderboard;

  return (
    <div className="page football-room-page">
      {showTransition ? (
        <FootballEntryTransition
          onComplete={() => navigate("/football", { replace: true, state: null })}
        />
      ) : null}

      {!showTransition ? <FootballGamesEarlyAccessBanner /> : null}
      <PlayLandingHeader sport="football" />

      <section className="football-daily-hq" aria-labelledby="football-daily-title">
        <div className="football-daily-hq__heading">
          <div>
            <p className="eyebrow">TODAY’S CHALLENGE</p>
            <h2 id="football-daily-title">{dailyTitle}</h2>
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
              <strong>{runtime.projection?.officialAttempt ? "Today’s official result is saved." : runtime.projection?.progressRevision ? "Your official game is in progress." : "One official board. Same challenge for everyone."}</strong>
              <p>NFL and college football both live here. Your first run is the one that counts.</p>
            </div>
            <button className="primary-action" type="button" onClick={() => navigate("/football/today")}>{runtime.projection?.officialAttempt ? "VIEW RESULT →" : runtime.projection?.progressRevision ? "CONTINUE →" : "PLAY TODAY →"}</button>
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
      <PlayLandingGameLibrary sport="football" onNavigate={navigate} />
    </div>
  );
}
