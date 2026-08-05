import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { DailyChallengeStandings } from "./DailyChallengeStandings";
import { todayChallengeAdapter, type DailyGameType } from "./todaysChallengeAdapters";
import type {
  TodayChallengeLeaderboard,
  TodayChallengeProjection,
} from "./todayChallengeRepository";
import { useTodayChallengeOverview } from "./useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "./useTodayChallengeRuntime";

function dayLabel(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

function gameProgress(projection: TodayChallengeProjection) {
  const state = projection.publicState;
  switch (projection.gameType) {
    case "find_leader":
      return `${Array.isArray(state.eliminated_ids) ? state.eliminated_ids.length : 0}/9 SAFE`;
    case "wavelength":
      return `${Array.isArray(state.guesses) ? state.guesses.length : 0}/4 GUESSES`;
    case "blind_resume":
      return `${Array.isArray(state.results) ? state.results.length : 0}/5 PICKS`;
    case "blind_rank_5":
      return `${Array.isArray(state.slots) ? state.slots.filter(Boolean).length : 0}/5 PLACED`;
    case "keep_4_cut_4": {
      const kept = Array.isArray(state.kept) ? state.kept.length : 0;
      const cut = Array.isArray(state.cut) ? state.cut.length : 0;
      return `${kept + cut}/8 CALLS`;
    }
  }
}


function LeaderboardAvatar({ entry }: { entry: TodayChallengeLeaderboard["entries"][number] }) {
  return entry.avatarPhotoData ? (
    <img src={entry.avatarPhotoData} alt="" />
  ) : (
    <span>{entry.initials}</span>
  );
}

function DailyLeaderboard({
  leaderboard,
  gameType,
  loading,
}: {
  leaderboard: TodayChallengeLeaderboard | null;
  gameType: DailyGameType;
  loading: boolean;
}) {
  if (loading && !leaderboard) {
    return <p className="today-hub-empty">Loading today’s leaderboard…</p>;
  }
  if (!leaderboard?.unlocked) {
    return (
      <p className="today-hub-empty">
        Finish today’s official game to unlock the group leaderboard.
      </p>
    );
  }
  if (!leaderboard.entries.length) {
    return <p className="today-hub-empty">No official finishes yet.</p>;
  }
  return (
    <div className="today-hub-leaderboard__rows">
      {leaderboard.entries.slice(0, 8).map((entry) => (
        <article className={entry.isCurrentUser ? "is-current" : ""} key={`${entry.rank}-${entry.displayName}`}>
          <b>#{entry.rank}</b>
          <LeaderboardAvatar entry={entry} />
          <strong>{entry.displayName}</strong>
          <em>{todayChallengeAdapter(gameType)?.nativeDisplay({
            nativeScore: entry.nativeScore,
            publicResult: {},
          }) ?? entry.nativeScore}</em>
          <small>{entry.normalizedScore}</small>
        </article>
      ))}
    </div>
  );
}

export default function TodayChallengeHub() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<"challenge" | "leaderboard">("challenge");
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const profileId = identity.profile?.id ?? "signed-out";
  const runtime = useTodayChallengeRuntime({ profileId, enabled: signedIn });
  const overview = useTodayChallengeOverview({
    profileId,
    enabled: signedIn,
    projection: runtime.projection,
  });
  const projection = runtime.projection;
  const adapter = useMemo(
    () => todayChallengeAdapter(projection?.gameType),
    [projection?.gameType],
  );

  if (!signedIn) {
    return (
      <section className="today-hub-gate">
        <div>
          <p className="eyebrow">TODAY’S CHALLENGE</p>
          <h2>One official game. One first attempt.</h2>
          <p>Sign in to load today’s exact game, save progress across devices, and join the official leaderboard.</p>
        </div>
        <button type="button" onClick={identity.openDialog}>SIGN IN TO PLAY</button>
      </section>
    );
  }

  if (runtime.loading && !projection) {
    return (
      <section className="today-hub-loading" aria-live="polite">
        <span />
        <strong>Loading today’s official game…</strong>
      </section>
    );
  }

  if (!projection || !adapter) {
    return (
      <section className="today-hub-gate is-error">
        <div>
          <p className="eyebrow">TODAY’S CHALLENGE</p>
          <h2>The official game did not load.</h2>
          <p>{runtime.error instanceof Error ? runtime.error.message : "Refresh the official daily connection and try again."}</p>
        </div>
        <button type="button" onClick={() => void runtime.refresh()}>TRY AGAIN</button>
      </section>
    );
  }

  const completed = Boolean(projection.officialAttempt);
  return (
    <section className="today-hub" data-game={projection.gameType}>
      <div className="today-hub__tabs" aria-label="Today’s Challenge panels">
        <button className={panel === "challenge" ? "is-active" : ""} type="button" onClick={() => setPanel("challenge")}>TODAY’S GAME</button>
        <button className={panel === "leaderboard" ? "is-active" : ""} type="button" onClick={() => setPanel("leaderboard")}>LEADERBOARD</button>
      </div>

      {panel === "challenge" ? (
        <button className="today-hub-card" type="button" onClick={() => navigate(adapter.dailyRoute)}>
          <div className="today-hub-card__topline">
            <span>TODAY’S CHALLENGE</span>
            <b>{dayLabel(projection.centralDay).toUpperCase()}</b>
          </div>
          <div className="today-hub-card__body">
            <div>
              <small>{completed ? "OFFICIAL RESULT" : gameProgress(projection)}</small>
              <h2>{adapter.title}</h2>
              <p>{adapter.instructions}</p>
            </div>
            <aside>
              {completed && projection.officialAttempt ? (
                <>
                  <span>DAILY SCORE</span>
                  <strong>{projection.officialAttempt.normalizedScore}</strong>
                  <small>{adapter.nativeDisplay(projection.officialAttempt)}</small>
                </>
              ) : (
                <>
                  <span>{projection.progressRevision > 0 ? "SAVED PROGRESS" : "OFFICIAL DAILY"}</span>
                  <strong>{projection.progressRevision > 0 ? gameProgress(projection) : "NEW"}</strong>
                  <small>Across devices</small>
                </>
              )}
            </aside>
          </div>
          <em>{completed ? "VIEW OFFICIAL RESULT" : projection.progressRevision > 0 ? "CONTINUE OFFICIAL GAME" : adapter.cta.toUpperCase()} →</em>
        </button>
      ) : (
        <div className="today-hub-leaderboard">
          <header>
            <div><p className="eyebrow">OFFICIAL DAILY</p><h2>{adapter.title} leaderboard</h2></div>
            <span>{overview.leaderboard?.playerCount ?? 0} PLAYERS</span>
          </header>
          <DailyLeaderboard
            leaderboard={overview.leaderboard}
            gameType={projection.gameType}
            loading={overview.leaderboardLoading}
          />
        </div>
      )}

<DailyChallengeStandings
  standings={overview.standings}
  loading={overview.standingsLoading}
  error={overview.error instanceof Error ? overview.error : null}
  onRefresh={() => { void overview.refresh(); }}
/>
    </section>
  );
}
