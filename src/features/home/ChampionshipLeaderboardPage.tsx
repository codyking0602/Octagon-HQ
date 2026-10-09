import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { loadMlbChampionship, type MlbChampionship } from "../mlb/mlbChampionship";
import {
  loadSportChampionship,
  loadSportChampionshipWeekly,
  type SportChampionship,
  type SportChampionshipEntry,
  type SportChampionshipWeekly,
} from "../play/sportChampionshipRepository";
import "../../styles/championship-leaderboard.css";

type Sport = "football" | "ufc" | "mlb";
type Lane = "overall" | "picks" | "play";
function isSport(value: string | undefined): value is Sport {
  return value === "football" || value === "ufc" || value === "mlb";
}
function shortScore(value: number | null | undefined) {
  return value == null ? "—" : value.toFixed(1);
}
function formatWeek(start: string, end: string) {
  const date = (s: string) => new Date(s + "T12:00:00Z");
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return formatter.format(date(start)) + " – " + formatter.format(date(end));
}
function getRank(player: SportChampionshipEntry, lane: Lane) {
  return lane === "overall" ? player.rank : lane === "picks" ? player.picks_rank : player.play_rank;
}
function getScore(player: SportChampionshipEntry, lane: Lane) {
  return lane === "overall" ? player.rating : lane === "picks" ? player.picks_rating : player.play_rating;
}
function PlayerBreakdown({ player, sport }: { player: SportChampionshipEntry; sport: "football" | "ufc" }) {
  return (
    <div className="champ-board__breakdown">
      <div className="champ-board__metrics">
        <span>Overall <b>{shortScore(player.rating)}</b></span>
        <span>Picks <b>{shortScore(player.picks_rating)}</b></span>
        <span>Play <b>{shortScore(player.play_rating)}</b></span>
      </div>
      <p>
        {player.picks_played} Picks events · {player.daily_played} Dailies
        {sport === "football" ? ` · ${player.featured_played} Featured` : ""}
      </p>
      {player.event_results.length > 0 ? (
        <div className="champ-board__events">
          <h3>Game-by-game finishes</h3>
          {player.event_results.map((result, index) => (
            <div key={result.type + ":" + result.date + ":" + index}>
              <span><strong>{result.label}</strong><small>{result.date} · {result.played ? "Played" : "Missed · last-place points"}</small></span>
              <b>#{result.rank}</b><strong>{shortScore(result.points)}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
function SeasonBoard({
  sport, championship, selectedTab, selectedPlayer, onSelectPlayer,
}: {
  sport: "football" | "ufc";
  championship: SportChampionship;
  selectedTab: Lane;
  selectedPlayer: string | null;
  onSelectPlayer: (id: string | null) => void;
}) {
  const entries = useMemo(() =>
    [...championship.entries].sort((a, b) =>
      getRank(a, selectedTab) - getRank(b, selectedTab)
      || (getScore(b, selectedTab) ?? 0) - (getScore(a, selectedTab) ?? 0)
      || a.display_name.localeCompare(b.display_name)),
    [championship.entries, selectedTab]);
  return (
    <div className="champ-board__standings" role="tabpanel" aria-label={selectedTab + " Championship standings"}>
      <div className="champ-board__table-heading">
        <span>PLAYER</span><span>{selectedTab === "overall" ? "SEASON SCORE" : selectedTab === "picks" ? "PICKS SCORE" : "PLAY SCORE"}</span>
      </div>
      {entries.map((player) => {
        const expanded = selectedPlayer === player.profile_id;
        return (
          <div key={player.profile_id} className={`champ-board__member${player.is_current_user ? " is-you" : ""}`}>
            <button type="button" className="champ-board__member-row" aria-expanded={expanded}
              onClick={() => onSelectPlayer(expanded ? null : player.profile_id)}>
              <b className="champ-board__rank">{getRank(player, selectedTab) === 1 ? "🏆" : "#" + getRank(player, selectedTab)}</b>
              <span className="champ-board__identity"><strong>{player.display_name}</strong>{player.is_current_user ? <small>YOU</small> : null}</span>
              <strong className="champ-board__value">{shortScore(getScore(player, selectedTab))}</strong>
              <span className="champ-board__chevron" aria-hidden="true">{expanded ? "⌃" : "›"}</span>
            </button>
            {expanded ? <PlayerBreakdown player={player} sport={sport} /> : null}
          </div>
        );
      })}
    </div>
  );
}

export default function ChampionshipLeaderboardPage() {
  const params = useParams();
  const sport: Sport = isSport(params.sport) ? params.sport : "football";
  const [search, setSearch] = useSearchParams();
  const rawTab = search.get("tab");
  const tab: Lane = rawTab === "picks" || rawTab === "play" ? rawTab : "overall";
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(search.get("player"));
  const identity = useIdentity();
  const [data, setData] = useState<SportChampionship | null>(null);
  const [weekly, setWeekly] = useState<SportChampionshipWeekly | null>(null);
  const [mlb, setMlb] = useState<MlbChampionship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [weekIndex, setWeekIndex] = useState(0);

  useEffect(() => {
    let active = true;
    setData(null); setWeekly(null); setMlb(null);
    setLoading(true); setError(""); setArchiveOpen(false); setWeekIndex(0);
    if (!identity.profile?.id) {
      setLoading(false);
      return () => { active = false; };
    }
    const load = async () => {
      try {
        if (sport === "mlb") {
          const next = await loadMlbChampionship(2026);
          if (active) setMlb(next);
        } else {
          const next = await loadSportChampionship(sport, 2026);
          if (active) setData(next);
          const weeks = await loadSportChampionshipWeekly(sport, 2026);
          if (active) setWeekly(weeks);
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load Championship standings.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [sport, identity.profile?.id]);

  const currentWeek = weekly?.weeks[weekIndex] ?? null;
  const championshipTitle = sport === "football" ? "Football Championship" : sport === "ufc" ? "UFC Championship" : "MLB Postseason Championship";
  const changeTab = (value: Lane) => {
    const next = new URLSearchParams(search);
    next.set("tab", value); next.delete("player");
    setSearch(next);
    setSelectedPlayer(null);
  };
  return (
    <div className="page champ-board" data-sport={sport}>
      <header className="champ-board__top">
        <Link to="/" aria-label="Back to Your HQ">← Your HQ</Link>
        <span>2026 SEASON</span>
      </header>
      <div className="champ-board__title">
        <span>🏆</span>
        <div><h1>{championshipTitle}</h1><p>{sport === "mlb" ? "Postseason Series · Bracket · Play" : "Picks 60% · Play 40%"}</p></div>
      </div>
      {!identity.profile?.id ? (
        <div className="champ-board__notice">Sign in to view the Championship leaderboard.</div>
      ) : loading ? (
        <div className="champ-board__notice" role="status">Loading standings…</div>
      ) : error || (sport !== "mlb" && !data) || (sport === "mlb" && !mlb) ? (
        <div className="champ-board__notice" role="alert">{error || "Standings unavailable."}</div>
      ) : sport === "mlb" && mlb ? (
        <section className="champ-board__standings" aria-label="MLB Postseason Championship standings">
          <div className="champ-board__table-heading"><span>PLAYER</span><span>POSTSEASON POINTS</span></div>
          {[...mlb.standings].sort((a, b) => a.overall_rank - b.overall_rank).map((entry) => (
            <div className={`champ-board__member${entry.is_current_user ? " is-you" : ""}`} key={entry.profile_id}>
              <div className="champ-board__member-row"><b className="champ-board__rank">#{entry.overall_rank}</b>
                <span className="champ-board__identity"><strong>{entry.display_name}</strong></span>
                <strong className="champ-board__value">{shortScore(entry.total_points)}</strong></div>
              <div className="champ-board__metrics"><span>Series <b>{shortScore(entry.series_points)}</b></span>
                <span>Bracket <b>{shortScore(entry.bracket_points)}</b></span><span>Play <b>{shortScore(entry.play_points)}</b></span></div>
            </div>
          ))}
        </section>
      ) : data && sport !== "mlb" ? (
        <>
          <div className="champ-board__tabs" role="tablist" aria-label="Championship leaderboard category">
            {(["overall", "picks", "play"] as const).map((lane) => (
              <button key={lane} type="button" role="tab" aria-selected={tab === lane} className={tab === lane ? "is-active" : ""}
                onClick={() => changeTab(lane)}>{lane === "overall" ? "Overall" : lane === "picks" ? "Picks" : "Play"}</button>
            ))}
          </div>
          <SeasonBoard sport={sport} championship={data} selectedTab={tab} selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer} />
          <div className="champ-board__explain">
            <strong>How the Season Score works</strong>
            <p>Every completed event earns placement points: 1st 100 · 2nd 92 · 3rd 85 · 4th 79 · 5th 74 · 6th 70. Missing an event earns last-place points for the Championship field.</p>
            <p>{data.weights.featured
              ? "Football: 60% Picks + 30% Daily + 10% Featured Weekly."
              : "UFC: 60% Picks + 40% Daily until Featured Weekly games are available."} Weekly champions are crowned separately from these season scores.</p>
          </div>
          {currentWeek ? (
            <section className="champ-board__weekly" id="weekly-champions">
              <header><span>CHAMPION OF THE WEEK</span><span>{formatWeek(currentWeek.week_start, currentWeek.week_end)}</span></header>
              <div className="champ-board__weekly-winner"><span>🏆</span>
                <strong>{currentWeek.winner.display_name}</strong>
                <b>{shortScore(currentWeek.winner.rating)} WEEKLY SCORE</b></div>
              <p>{currentWeek.event_counts.picks} Picks · {currentWeek.event_counts.daily} Daily · {currentWeek.event_counts.featured} Featured</p>
              <button type="button" className="champ-board__weekly-toggle" onClick={() => setArchiveOpen(!archiveOpen)}>
                {archiveOpen ? "Hide Weekly History" : "View Weekly Champions"} {archiveOpen ? "⌃" : "›"}
              </button>
              {archiveOpen ? (
                <div className="champ-board__archive">
                  <div className="champ-board__archive-weeks">
                    {weekly?.weeks.map((week, index) => (
                      <button key={week.week_start} type="button" className={weekIndex === index ? "is-active" : ""}
                        onClick={() => setWeekIndex(index)}>
                        {formatWeek(week.week_start, week.week_end)}
                      </button>
                    ))}
                  </div>
                  <div className="champ-board__table-heading"><span>WEEKLY PLAYER</span><span>WEEK SCORE</span></div>
                  {currentWeek.entries.map((entry) => (
                    <div key={entry.profile_id} className="champ-board__week-row">
                      <span>#{entry.rank} · {entry.display_name}</span><strong>{shortScore(entry.rating)}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
