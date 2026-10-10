import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadMlbChampionship, type MlbChampionship } from "../mlb/mlbChampionship";
import {
  loadSportChampionship,
  type SportChampionship,
  type SportChampionshipEntry,
} from "../play/sportChampionshipRepository";
import "../../styles/home-championship-owner.css";

export type SportFilter = "all" | "football" | "ufc" | "mlb";
type ChampionshipSport = "football" | "ufc";

function formatRank(rank: number | null | undefined) {
  return rank ? "#" + rank : "—";
}

function formatRating(rating: number | null | undefined) {
  return rating == null ? "—" : rating.toFixed(1);
}

function Summary({ sport, result }: { sport: ChampionshipSport; result: SportChampionship | null }) {
  const own = result?.own ?? null;
  return (
    <Link className="home-champ-preview__summary" data-sport={sport} to={"/championship/" + sport + "?tab=overall"} aria-label={"Open " + sport + " Championship standings"}>
      <span>{sport === "ufc" ? "UFC" : "FOOTBALL"} CHAMPIONSHIP</span>
      <strong>{formatRank(own?.rank)}</strong>
      <small>{own?.rating != null ? formatRating(own.rating) + " SEASON SCORE" : "STANDING PENDING"}</small>
    </Link>
  );
}

function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const reducedMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof window.requestAnimationFrame !== "function") {
      setDisplay(value);
      return;
    }
    let animation = 0;
    let started: number | null = null;
    const from = Math.max(0, value - 5);
    const tick = (now: number) => {
      if (started === null) started = now;
      const fraction = Math.min(1, (now - started) / 620);
      const eased = 1 - Math.pow(1 - fraction, 3);
      setDisplay(from + (value - from) * eased);
      if (fraction < 1) animation = window.requestAnimationFrame(tick);
    };
    animation = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animation);
  }, [value]);

  return <>{formatRating(display)}</>;
}

function TrophyMark() {
  return (
    <svg className="home-champ-preview__trophy" width="35" height="35" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M9 4h14v8c0 6-3.2 10-7 10s-7-4-7-10V4Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M9 7H4v4c0 4 2 6 6 6M23 7h5v4c0 4-2 6-6 6M16 22v4M10 28h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m16 8 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4L16 8Z" fill="currentColor" />
    </svg>
  );
}

function Detail({ sport, result, loading, error }: {
  sport: ChampionshipSport;
  result: SportChampionship | null;
  loading: boolean;
  error: string;
}) {
  const own: SportChampionshipEntry | null = result?.own ?? null;
  const label = sport === "football" ? "Football" : "UFC";
  const overallRoute = "/championship/" + sport + "?tab=overall";
  const standings = (result?.entries ?? [])
    .filter((member) => member.rating != null)
    .slice()
    .sort((a, b) => a.rank - b.rank || (b.rating ?? 0) - (a.rating ?? 0) || a.display_name.localeCompare(b.display_name));
  const leaders = standings.slice(0, 3);
  if (own && !leaders.some((member) => member.profile_id === own.profile_id)) leaders.push(own);
  const leader = standings[0];
  const closestChallenger = standings.find((member) => member.profile_id !== own?.profile_id);
  const leadMargin = own?.rating != null && closestChallenger?.rating != null
    ? own.rating - closestChallenger.rating : null;
  const gapToLeader = own?.rating != null && leader?.rating != null
    ? leader.rating - own.rating : null;
  const tiedForLead = own?.rank === 1 && standings.some((member) => member.profile_id !== own.profile_id && member.rank === 1);
  const status = own?.rank === 1 ? (tiedForLead ? "TIED FOR THE LEAD" : "LEAGUE LEADER")
    : own?.rank === 2 ? "CHASING THE LEAD"
      : own?.rank === 3 ? "PODIUM POSITION" : "IN THE HUNT";
  const standingsContext = own?.rank === 1 && leadMargin != null && closestChallenger
    ? leadMargin > 0
      ? "+" + leadMargin.toFixed(1) + " over " + closestChallenger.display_name
      : "Dead heat at the top"
    : gapToLeader != null && gapToLeader > 0
      ? gapToLeader.toFixed(1) + " points from 1st"
      : null;
  return (
    <div className="home-champ-preview__detail" data-sport={sport} key={sport}>
      <div className="home-champ-preview__kicker">{label.toUpperCase()} CHAMPIONSHIP · {result?.season ?? 2026}</div>
      {loading ? (
        <div className="home-champ-preview__pending" role="status">Loading official standings…</div>
      ) : error || !own ? (
        <div className="home-champ-preview__pending" role="status">
          {error ? "Championship standings unavailable" : "No Championship standing yet"}
        </div>
      ) : (
        <>
          <div className="home-champ-preview__hero">
            <div className="home-champ-preview__honor">
              <TrophyMark />
              <span>{status}</span>
            </div>
            <Link className="home-champ-preview__rank-link" to={overallRoute} aria-label={"Open " + label + " overall leaderboard"}>
              <strong>{formatRank(own.rank)}</strong>
              <span>OF {result?.field_size ?? standings.length} COMPETITORS</span>
            </Link>
            <Link className="home-champ-preview__season-link" to={overallRoute + "&player=" + own.profile_id} aria-label={"View your " + label + " Season Score breakdown"}>
              <strong><AnimatedScore value={own.rating ?? 0} /></strong>
              <span>SEASON SCORE</span>
            </Link>
          </div>
          <div className="home-champ-preview__race">
            <div className="home-champ-preview__race-top">
              <div>
                <span>CHAMPIONSHIP STANDINGS</span>
                {standingsContext ? <small>{standingsContext}</small> : null}
              </div>
              <Link to={overallRoute} aria-label={"View all " + label + " Championship standings"}>VIEW ALL <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-champ-preview__race-list">
              {leaders.map((member) => (
                <Link
                  key={member.profile_id}
                  className={"home-champ-preview__competitor" + (member.profile_id === own.profile_id ? " is-you" : "")}
                  to={overallRoute + "&player=" + member.profile_id}
                  aria-label={"View " + member.display_name + " Championship standing"}
                >
                  <span className="home-champ-preview__placing" aria-hidden="true">{member.rank === 1 ? "★" : member.rank}</span>
                  <span className="home-champ-preview__avatar" aria-hidden="true">{member.initials || member.display_name.slice(0, 2)}</span>
                  <span className="home-champ-preview__competitor-main">
                    <span className="home-champ-preview__competitor-name">{member.is_current_user || member.profile_id === own.profile_id ? "You" : member.display_name}</span>
                    <span className="home-champ-preview__meter" aria-hidden="true">
                      <span style={{ width: Math.min(100, Math.max(0, member.rating ?? 0)) + "%" }} />
                    </span>
                  </span>
                  <strong>{formatRating(member.rating)}</strong>
                </Link>
              ))}
            </div>
          </div>
          <div className="home-champ-preview__lanes">
            <Link to={"/championship/" + sport + "?tab=picks"} aria-label={"Open " + label + " Picks leaderboard"}>
              <span>PICKS · 60%</span>
              <strong>{formatRank(own.picks_rank)} <span className="home-champ-preview__chevron" aria-hidden="true">↗</span></strong>
              <span className="home-champ-preview__weight-track" aria-hidden="true"><i style={{ width: "60%" }} /></span>
            </Link>
            <Link to={"/championship/" + sport + "?tab=play"} aria-label={"Open " + label + " Play leaderboard"}>
              <span>PLAY · 40%</span>
              <strong>{formatRank(own.play_rank)} <span className="home-champ-preview__chevron" aria-hidden="true">↗</span></strong>
              <span className="home-champ-preview__weight-track" aria-hidden="true"><i style={{ width: "40%" }} /></span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function OwnerChampionshipHome({
  streak,
  streakLoading,
  showMlb,
  sport,
  onSportChange,
}: {
  streak: number;
  streakLoading: boolean;
  showMlb: boolean;
  sport: SportFilter;
  onSportChange: (nextSport: SportFilter) => void;
}) {
  const [football, setFootball] = useState<SportChampionship | null>(null);
  const [ufc, setUfc] = useState<SportChampionship | null>(null);
  const [mlb, setMlb] = useState<MlbChampionship | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<ChampionshipSport, string>>({ football: "", ufc: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      const [footballResult, ufcResult, mlbResult] = await Promise.allSettled([
        loadSportChampionship("football"),
        loadSportChampionship("ufc"),
        showMlb ? loadMlbChampionship(2026) : Promise.resolve(null),
      ]);
      if (!active) return;
      setFootball(footballResult.status === "fulfilled" ? footballResult.value : null);
      setUfc(ufcResult.status === "fulfilled" ? ufcResult.value : null);
      setMlb(mlbResult.status === "fulfilled" ? mlbResult.value : null);
      setErrors({
        football: footballResult.status === "rejected" ? "unavailable" : "",
        ufc: ufcResult.status === "rejected" ? "unavailable" : "",
      });
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [showMlb]);

  const chosen = sport === "mlb" && !showMlb ? "all" : sport;
  return (
    <section
      className="home-section home-section--your-hq home-champ-preview"
      data-testid="home-section"
      data-home-section="your-hq"
      data-sport={chosen}
      aria-label="Your HQ"
    >
      <div className="home-champ-preview__top">
        <div><h2>Your HQ</h2>{chosen === "all" ? <small>CHAMPIONSHIP · 2026 SEASON</small> : null}</div>
        <label className="home-champ-preview__filter">
          <span className="sr-only">Home sport</span>
          <select aria-label="Home sport" value={chosen} onChange={(event) => onSportChange(event.target.value as SportFilter)}>
            <option value="all">All sports</option>
            <option value="football">Football</option>
            <option value="ufc">UFC</option>
            {showMlb ? <option value="mlb">MLB</option> : null}
          </select>
        </label>
      </div>
      {chosen === "all" ? (
        <>
          <div className="home-champ-preview__overview">
            <Summary sport="football" result={football} />
            <Summary sport="ufc" result={ufc} />
            {showMlb ? (
              <Link className="home-champ-preview__summary" data-sport="mlb" to="/championship/mlb" aria-label="Open MLB Postseason Championship standings">
                <span>MLB POSTSEASON</span>
                <strong>{formatRank(mlb?.own?.overall_rank)}</strong>
                <small>{mlb?.own ? String(mlb.own.total_points) + " PTS" : "STANDING PENDING"}</small>
              </Link>
            ) : null}
          </div>
          <div className="home-champ-preview__streak">
            <span>HQ DAILY STREAK</span>
            <strong>{streakLoading ? "…" : streak} days</strong>
          </div>
        </>
      ) : chosen === "mlb" ? (
        <div className="home-champ-preview__detail" data-sport="mlb">
          <div className="home-champ-preview__kicker">MLB POSTSEASON CHAMPIONSHIP</div>
          <div className="home-champ-preview__headline">
            <Link to="/championship/mlb" aria-label="Open MLB Postseason Championship leaderboard"><strong>{formatRank(mlb?.own?.overall_rank)}</strong><span>OF {mlb?.standings.length ?? 0} COMPETITORS</span></Link>
            <Link to="/championship/mlb" aria-label="View MLB Championship Points breakdown"><strong>{mlb?.own?.total_points ?? "—"}</strong><span>CHAMPIONSHIP POINTS</span></Link>
          </div>
        </div>
      ) : (
        <Detail sport={chosen} result={chosen === "football" ? football : ufc} loading={loading} error={errors[chosen]} />
      )}
    </section>
  );
}
