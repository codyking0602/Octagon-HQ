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
    <article className="home-champ-preview__summary" data-sport={sport}>
      <span>{sport === "ufc" ? "UFC" : "FOOTBALL"} CHAMPIONSHIP</span>
      <strong>{formatRank(own?.rank)}</strong>
      <small>{own?.rating != null ? formatRating(own.rating) + " RATING" : "STANDING PENDING"}</small>
    </article>
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
  return (
    <div className="home-champ-preview__detail" data-sport={sport}>
      <div className="home-champ-preview__kicker">{label.toUpperCase()} CHAMPIONSHIP · 2026</div>
      {loading ? (
        <div className="home-champ-preview__pending" role="status">Loading official standings…</div>
      ) : error || !own ? (
        <div className="home-champ-preview__pending" role="status">
          {error ? "Championship standings unavailable" : "No Championship standing yet"}
        </div>
      ) : (
        <>
          <div className="home-champ-preview__headline">
            <div><strong>{formatRank(own.rank)}</strong><span>OF {result?.field_size ?? 0}</span></div>
            <div><strong>{formatRating(own.rating)}</strong><span>CHAMPIONSHIP RATING</span></div>
          </div>
          <div className="home-champ-preview__lanes">
            <div><span>PICKS · 60%</span><strong>{formatRank(own.picks_rank)}</strong><small>{formatRating(own.picks_rating)} rating</small></div>
            <div><span>PLAY · 40%</span><strong>{formatRank(own.play_rank)}</strong><small>{formatRating(own.play_rating)} rating</small></div>
          </div>
          <p className="home-champ-preview__weights">
            {result?.weights.featured
              ? "Play: 30% Daily · 10% Featured Weekly"
              : "Play: 40% Daily · Featured Weekly not active"}
          </p>
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
      aria-label="Your HQ"
    >
      <div className="home-champ-preview__top">
        <div><h2>Your HQ</h2><small>CHAMPIONSHIP · OWNER PREVIEW</small></div>
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
              <article className="home-champ-preview__summary" data-sport="mlb">
                <span>MLB POSTSEASON</span>
                <strong>{formatRank(mlb?.own?.overall_rank)}</strong>
                <small>{mlb?.own ? String(mlb.own.total_points) + " PTS" : "STANDING PENDING"}</small>
              </article>
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
            <div><strong>{formatRank(mlb?.own?.overall_rank)}</strong><span>OF {mlb?.standings.length ?? 0}</span></div>
            <div><strong>{mlb?.own?.total_points ?? "—"}</strong><span>CHAMPIONSHIP POINTS</span></div>
          </div>
          <p className="home-champ-preview__weights">MLB retains its existing postseason scoring rules.</p>
        </div>
      ) : (
        <Detail sport={chosen} result={chosen === "football" ? football : ufc} loading={loading} error={errors[chosen]} />
      )}
    </section>
  );
}
