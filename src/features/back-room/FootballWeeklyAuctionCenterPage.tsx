import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createFootballWeeklyAuctionRepository,
  type FootballWeeklyAuctionState,
  type FootballWeeklyFinal,
} from "../play/footballWeeklyAuctionRepository";
import { FootballWeeklyAuctionFinalResult } from "./FootballWeeklyAuctionGate";
import { FootballWeeklyBuildQbFinalResult } from "./FootballWeeklyBuildQbGate";
import { FootballWeeklySuperteamFinalResult } from "./FootballWeeklySuperteamGate";
import { FootballWeeklyNflTeamSeasonFinalResult } from "./FootballWeeklyNflTeamSeasonGate";
import { useIdentity } from "../identity/IdentityProvider";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import { hqImpostorV1Window } from "../impostor/hqImpostorSchedule";
import "../../styles/football-weekly-auction-center.css";

type CenterTab = "week" | "results";

function subjectLabel(subjectKey: FootballWeeklyFinal["subject_key"] | "cfb-best-teams-since-2000") {
  if (subjectKey === "cfb-superteam") return "CFB SUPERTEAM";
  if (subjectKey === "nfl-build-qb") return "NFL BUILD A QB";
  if (subjectKey === "nfl-best-team-seasons-since-2000") return "NFL BEST TEAM-SEASONS SINCE 2000";
  return "CFB BEST TEAMS SINCE 2000";
}

function weekLabel(weekStart: string) {
  const start = new Date(`${weekStart}T12:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const startMonth = month.format(start).toUpperCase();
  const endMonth = month.format(end).toUpperCase();
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  return startMonth === endMonth
    ? `${startMonth} ${startDay}–${endDay}`
    : `${startMonth} ${startDay}–${endMonth} ${endDay}`;
}

function archivedScore(result: FootballWeeklyFinal) {
  const me = result.my_result;
  if (me.final_score == null) return "NO FINAL SCORE";
  if (result.subject_key === "cfb-best-teams-since-2000") return me.final_score.toFixed(1) + " BEST-3";
  if (result.subject_key === "nfl-best-team-seasons-since-2000") return me.final_score.toFixed(1) + " BEST-4";
  return me.final_score.toFixed(1) + " AVG";
}

export default function FootballWeeklyAuctionCenterPage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const owner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);
  const impostorWindow = hqImpostorV1Window();
  const repository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const [tab, setTab] = useState<CenterTab>("week");
  const [state, setState] = useState<FootballWeeklyAuctionState | null>(null);
  const [history, setHistory] = useState<FootballWeeklyFinal[]>([]);
  const [selectedResult, setSelectedResult] = useState<FootballWeeklyFinal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!repository) {
      setError("Weekly Auction is unavailable on this build.");
      setLoading(false);
      return () => { active = false; };
    }

    const request = impostorWindow.active
      ? repository.loadHistory().then((nextHistory) => {
          if (!active) return;
          setState(null);
          setHistory(nextHistory);
        })
      : Promise.all([repository.load(), repository.loadHistory()]).then(([nextState, nextHistory]) => {
          if (!active) return;
          setState(nextState);
          setHistory(nextHistory);
        });

    request
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Weekly Auction could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [repository, impostorWindow.active]);

  if (selectedResult) {
    return (
      <div className="page football-weekly-auction-center">
        <div className="football-weekly-auction-center__archive-nav">
          <button type="button" onClick={() => setSelectedResult(null)}>← ALL RESULTS</button>
          <span>{weekLabel(selectedResult.week_start)} · {subjectLabel(selectedResult.subject_key)}</span>
        </div>
        {selectedResult.subject_key === "nfl-best-team-seasons-since-2000" ? (
          <FootballWeeklyNflTeamSeasonFinalResult
            result={selectedResult}
            busy={false}
            onAcknowledge={() => undefined}
            showNewWeekAction={false}
          />
        ) : selectedResult.subject_key === "cfb-superteam" ? (
          <FootballWeeklySuperteamFinalResult
            result={selectedResult}
            busy={false}
            onAcknowledge={() => undefined}
            showNewWeekAction={false}
          />
        ) : selectedResult.subject_key === "nfl-build-qb" ? (
          <FootballWeeklyBuildQbFinalResult
            result={selectedResult}
            busy={false}
            onAcknowledge={() => undefined}
            showNewWeekAction={false}
          />
        ) : (
          <FootballWeeklyAuctionFinalResult
            result={selectedResult}
            busy={false}
            onAcknowledge={() => undefined}
            showNewWeekAction={false}
          />
        )}
      </div>
    );
  }

  const activeState = state?.available ? state : null;

  return (
    <div className="page football-weekly-auction-center">
      <header className="football-weekly-auction-center__header">
        <button type="button" aria-label="Back to Football Play" onClick={() => navigate("/football")}>←</button>
        <div>
          <p className="eyebrow">WEEKLY AUCTION</p>
          <h1>AUCTION CENTER</h1>
          <span>Manage this week and revisit every completed result.</span>
        </div>
      </header>

      <nav className="football-weekly-auction-center__tabs" aria-label="Auction Center views">
        <button className={tab === "week" ? "is-active" : ""} type="button" onClick={() => setTab("week")}>THIS WEEK</button>
        <button className={tab === "results" ? "is-active" : ""} type="button" onClick={() => setTab("results")}>
          RESULTS{history.length ? ` · ${history.length}` : ""}
        </button>
      </nav>

      {owner ? (
        <button
          className="football-weekly-auction-center__lab"
          type="button"
          onClick={() => navigate("/football/weekly-auction-lab")}
        >
          <span>
            <small>OWNER QA · REAL ENGINE</small>
            <strong>WEEKLY AUCTION PLAYTHROUGH LAB</strong>
            <em>Control six seats, resolve seven days, reset to a fresh alternate board.</em>
          </span>
          <b>OPEN →</b>
        </button>
      ) : null}
      {owner ? (
        <button
          className="football-weekly-auction-center__lab"
          type="button"
          onClick={() => navigate("/football/weekly-nfl-team-season-lab")}
        >
          <span>
            <small>OWNER QA · NFL TEAM-SEASONS</small>
            <strong>BEST NFL TEAM-SEASONS PLAYTHROUGH</strong>
            <em>Control five seats through six auction days and the full Wildcard/Risk Draw finale.</em>
          </span>
          <b>OPEN →</b>
        </button>
      ) : null}

      {loading ? <section className="football-weekly-auction-center__message surface-card">Loading Weekly Auction…</section> : null}
      {error ? <section className="football-weekly-auction-center__message surface-card is-error">{error}</section> : null}

      {!loading && !error && tab === "week" ? (
        impostorWindow.active ? (
          <section className="football-weekly-auction-center__current surface-card">
            <div className="football-weekly-auction-center__current-title">
              <div>
                <small>OCT 13–19 · FEATURED CHALLENGE</small>
                <strong>HQ IMPOSTOR</strong>
              </div>
              <span>THIS WEEK</span>
            </div>
            <p>HQ Impostor replaces Weekly Auction for this featured week.</p>
            <button
              className="football-weekly-auction-center__primary"
              type="button"
              onClick={() => navigate("/impostor")}
            >
              OPEN HQ IMPOSTOR →
            </button>
          </section>
        ) : activeState ? (
          <section className="football-weekly-auction-center__current surface-card">
            <div className="football-weekly-auction-center__current-title">
              <div>
                <small>{weekLabel(activeState.week_start)} · DAY {activeState.day_index} OF 7</small>
                <strong>{subjectLabel(activeState.subject_key)}</strong>
              </div>
              <span>{activeState.subject_key === "nfl-best-team-seasons-since-2000" && activeState.day_index === 7
                ? (activeState.submitted_today ? "CHOICE IN" : "WILDCARD OPEN")
                : (activeState.submitted_today ? "BIDS IN" : "TODAY OPEN")}</span>
            </div>
            <div className="football-weekly-auction-center__metrics">
              <div><small>{activeState.subject_key === "nfl-build-qb" ? "TRAITS" : activeState.subject_key === "cfb-superteam" ? "ROSTER" : "TEAMS"}</small><strong>{activeState.owned_count}</strong></div>
              <div><small>BANKROLL</small><strong>${activeState.bankroll}</strong></div>
              <div><small>DAY</small><strong>{activeState.day_index}/7</strong></div>
            </div>
            <button
              className="football-weekly-auction-center__primary"
              type="button"
              onClick={() => navigate("/football/today?weekly=edit")}
            >
              {activeState.subject_key === "nfl-best-team-seasons-since-2000" && activeState.day_index === 7
                ? (activeState.submitted_today ? "EDIT WILDCARD CHOICE" : "OPEN WILDCARD FINALE")
                : (activeState.submitted_today ? "EDIT TODAY’S BIDS" : "OPEN TODAY’S AUCTION")} →
            </button>
          </section>
        ) : (
          <section className="football-weekly-auction-center__message surface-card">
            <strong>No active auction for your profile this week.</strong>
            <span>Your completed weeks remain available under Results.</span>
          </section>
        )
      ) : null}

      {!loading && !error && tab === "results" ? (
        <section className="football-weekly-auction-center__history">
          {history.length ? history.map((result) => {
            const me = result.my_result;
            return (
              <button type="button" key={result.week_start} onClick={() => setSelectedResult(result)}>
                <span className="football-weekly-auction-center__history-main">
                  <small>{weekLabel(result.week_start)}</small>
                  <strong>{subjectLabel(result.subject_key)}</strong>
                </span>
                <span className="football-weekly-auction-center__history-result">
                  <small>{me.is_winner ? "WEEKLY CHAMPION" : me.final_rank ? `FINISH #${me.final_rank}` : "FINAL RESULT"}</small>
                  <strong>{archivedScore(result)}</strong>
                </span>
                <em>VIEW →</em>
              </button>
            );
          }) : (
            <div className="football-weekly-auction-center__message surface-card">
              <strong>No completed Weekly Auction results yet.</strong>
              <span>Finished weeks will stay here permanently.</span>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
