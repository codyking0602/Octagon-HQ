import { Link, Navigate, useParams } from "react-router-dom";
import { memberProfilePath, normalizeMemberName } from "../members/memberProfilesModel";
import { useIdentity } from "../identity/IdentityProvider";
import type { PlaySport } from "./playRegistry";
import { playV2Score } from "./playV2Stats";
import { usePlayV2History } from "./usePlayV2History";
import { todayChallengeAdapter } from "./todaysChallengeAdapters";
import "../../styles/play-v2.css";

export default function PlayV2StatsPage({ sport, memberName }: { sport: PlaySport; memberName?: string }) {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? "";
  const normalizedMember = memberName ? normalizeMemberName(memberName) : null;
  const isOwn = Boolean(normalizedMember && identity.profile
    && normalizedMember === normalizeMemberName(identity.profile.displayName));
  const publicMemberView = Boolean(normalizedMember);
  const requestedMember = publicMemberView && !isOwn ? normalizedMember : null;
  const history = usePlayV2History(sport,
    profileId && (publicMemberView || identity.profile?.canControlPicks === true) ? profileId : "",
    requestedMember);
  if (identity.status === "loading") return <div className="page"><p>Loading account…</p></div>;
  if (!profileId || (!publicMemberView && identity.profile?.canControlPicks !== true)) {
    return <Navigate to={sport === "football" ? "/football" : "/play"} replace />;
  }
  const back = publicMemberView ? memberProfilePath(normalizedMember!) : sport === "football" ? "/football" : "/play";
  const summary = history.performance;
  return (
    <div className="page play-v2 play-v2__stats-page" data-sport={sport}>
      <header className="play-v2__stats-heading">
        <Link to={back}>← BACK TO {publicMemberView ? "PROFILE" : "PLAY"}</Link>
        <span>{requestedMember ?? "MY"} PLAY STATS · {sport.toUpperCase()} · OFFICIAL DAILY</span>
        <h1>{requestedMember ? requestedMember + "’s Performance" : "Your Performance"}</h1>
        <p>Normalized official Daily scores out of 100, not Championship placement points.
          {requestedMember ? " Today’s scores are visible once you finish the same Daily challenge." : ""}</p>
      </header>
      {history.loading ? <div className="play-v2__performance" role="status">Loading official history…</div>
        : history.error ? <div className="play-v2__performance"><p>Official history could not be loaded.</p>
          <button type="button" onClick={() => void history.refresh()}>RETRY</button></div>
          : !summary || !summary.count ? <section className="play-v2__performance">No completed official games recorded yet.</section>
            : (
              <>
                <section className="play-v2__performance" aria-label="All-time daily performance">
                  <div className="play-v2__section-top"><span>ALL-TIME OFFICIAL DAILY</span><span>{summary.count} RESULTS</span></div>
                  <div className="play-v2__metrics">
                    <div><span>CAREER AVG</span><strong>{playV2Score(summary.average)}</strong><small>/100</small></div>
                    <div><span>COMPLETED</span><strong>{summary.count}</strong><small>games</small></div>
                    <div><span>PERSONAL BEST</span><strong>{summary.best}</strong><small>/100</small></div>
                  </div>
                  <div className="play-v2__trend-block">
                    <span>LAST FIVE AVG: {playV2Score(summary.lastFiveAverage)}</span>
                    <span>PRIOR FIVE AVG: {playV2Score(summary.previousFiveAverage)}</span>
                  </div>
                </section>
                <section className="play-v2__stat-breakdown" aria-label="Scores by game">
                  <div className="play-v2__section-top"><span>BY GAME</span><span>{summary.byGame.length} GAME TYPES</span></div>
                  <div className="play-v2__stat-grid">
                    {summary.byGame.map((entry) => (
                      <article key={entry.gameType}>
                        <div><strong>{entry.title}</strong><small>{entry.count} official {entry.count === 1 ? "result" : "results"}</small></div>
                        <div className="play-v2__stat-row"><span>AVERAGE</span><strong>{playV2Score(entry.average)}</strong></div>
                        <div className="play-v2__stat-meter" aria-hidden="true"><span style={{ width: Math.max(0, Math.min(100, entry.average)) + "%" }} /></div>
                        <div className="play-v2__stat-foot"><span>BEST {entry.best}</span><span>LATEST {entry.latest}</span></div>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="play-v2__stat-breakdown" aria-label="Recent daily results">
                  <div className="play-v2__section-top"><span>RECENT RESULTS</span><span>LAST {summary.recent.length}</span></div>
                  <div className="play-v2__recent-list">
                    {summary.recent.map((entry, i) => (
                      <div key={entry.completedAt + ":" + entry.gameType + ":" + i}>
                        <span><strong>{todayChallengeAdapter(entry.gameType)?.title ?? entry.gameType}</strong><small>{entry.day}</small></span>
                        <strong>{entry.normalizedScore}<small>/100</small></strong>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
    </div>
  );
}

export function MemberPlayStatsPage() {
  const { memberName, sport } = useParams();
  if (!memberName || (sport !== "ufc" && sport !== "football")) {
    return <Navigate to={memberName ? memberProfilePath(memberName) : "/members"} replace />;
  }
  return <PlayV2StatsPage sport={sport} memberName={memberName} />;
}
