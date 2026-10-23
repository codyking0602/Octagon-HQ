import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { MatchupsCompact } from "../play/PlayV2Page";
import TodayChallengeHub from "../play/TodayChallengeHub";
import { createTodayChallengeRepository } from "../play/todayChallengeRepository";
import { canPreviewNbaWhoAmI } from "./NbaWhoAmIOwnerGate";
import {
  NBA_CASUAL_GAME_TYPES, NBA_DAILY_GAME_LABELS, NBA_DAILY_WEIGHTS,
  NBA_GAMES_LAUNCH_DAY, nbaCanAccessReleasedGames, nbaCentralDay,
  nbaOwnerPreviewDaily, nbaRegularSeasonDaily, type NbaDailyGame,
} from "./nbaDailySchedule";
import "../../styles/play-v2.css";
import "../../styles/nba-games-hub.css";

const NBA_GAME_ROUTES: Record<NbaDailyGame, string> = {
  average_fan: "/nba/average-fan",
  sports_feud: "/nba/sports-feud",
  millionaire: "/nba/millionaire",
  who_am_i: "/nba/who-am-i",
  find_leader: "/nba/find-the-leader",
  wavelength: "/nba/wavelength",
  bar_trivia: "/nba/bar-trivia",
  hit_the_number: "/nba/hit-the-number",
  higher_lower: "/nba/higher-lower",
};

const NBA_CASUAL_GAME_META: Record<(typeof NBA_CASUAL_GAME_TYPES)[number], { icon: string; description: string }> = {
  who_am_i: { icon: "?", description: "Guess from the clues" },
  find_leader: { icon: "#1", description: "Find the hidden statistical leader" },
  hit_the_number: { icon: "∑", description: "Build a lineup to hit the target" },
  higher_lower: { icon: "↕", description: "Compare NBA legends and seasons" },
};

function previewRoute(game: NbaDailyGame) {
  return NBA_GAME_ROUTES[game] + "?mode=daily";
}

const dailyGameOrder: readonly NbaDailyGame[] = [
  "average_fan", "sports_feud", "millionaire", "who_am_i", "find_leader",
  "wavelength", "bar_trivia", "hit_the_number", "higher_lower",
];

/**
 * Deliberately uses the exact UFC Play card primitives. The official NBA score
 * pipeline is still locked: never show browser-local preview results as ranked
 * attempts or invent standings, performance, or completion counts.
 */
export default function NbaPlayPage() {
  const navigate = useNavigate();
  const { profile, status } = useIdentity();
  const day = nbaCentralDay();
  const owner = canPreviewNbaWhoAmI(profile);
  const published = nbaCanAccessReleasedGames(day);
  const slot = nbaRegularSeasonDaily(day);
  const ownerPreview = nbaOwnerPreviewDaily(day);
  const featured = published ? slot?.gameType : owner ? ownerPreview ?? slot?.gameType : null;
  const [showOwnerCatalog, setShowOwnerCatalog] = useState(false);
  const repository = useMemo(() => createTodayChallengeRepository(undefined, "nba"), []);
  const history = useQuery({
    queryKey: ["nba", "official-daily-history", profile?.id ?? "signed-out"],
    queryFn: () => repository!.loadHistory(),
    enabled: published && Boolean(profile?.id) && Boolean(repository),
    refetchOnMount: "always",
  });
  const savedScores = (history.data ?? []).map(row => row.normalizedScore).filter(Number.isFinite);
  const completed = savedScores.length;
  const average = completed ? Math.round(savedScores.reduce((sum, score) => sum + score, 0) / completed) : null;
  const best = completed ? Math.max(...savedScores) : null;

  return <div className="page play-v2 nba-games-hub" data-sport="nba" data-testid="nba-play-v2-hub">
    <header className="play-v2__heading">
      <div><span>NBA PLAY</span><h1>Play</h1></div>
    </header>

    <section className="play-v2__daily" aria-label="Today's Challenge" data-sport="nba">
      {published ? <TodayChallengeHub sport="nba" /> : <>
      <div className="play-v2__section-top">
        <span>TODAY'S CHALLENGE</span>
        <span className="play-v2__daily-status">{published ? "OFFICIAL DAILY" : owner ? "OWNER PREVIEW" : "NOV 1 LAUNCH"}</span>
      </div>
      {featured ? <>
        <div className="play-v2__daily-row">
          <div className="play-v2__daily-title">
            <h2>{NBA_DAILY_GAME_LABELS[featured]}</h2>
            <span>{published && slot
              ? slot.isPublicationDay ? "New every other day · 48-hour window" : "Day 2 of 2 · challenge still open"
              : "Private rehearsal · not ranked"}</span>
          </div>
          <span className="play-v2__daily-arrow" aria-hidden="true">↗</span>
        </div>
        <div className="play-v2__daily-actions">
          <button type="button" onClick={() => navigate(published ? NBA_GAME_ROUTES[featured] : previewRoute(featured))}>
            {published ? "PLAY TODAY" : "TEST GAME"} →
          </button>
          <button type="button" disabled={!published} title={!published ? "Official NBA standings are not active yet." : undefined}>
            TODAY'S STANDINGS ↗
          </button>
        </div>
        {!published ? <p className="play-v2__muted">Preview play does not count toward the NBA championship or public leaderboards.</p> : null}
      </> : <>
        <div className="play-v2__daily-row">
          <div className="play-v2__daily-title">
            <h2>{day < NBA_GAMES_LAUNCH_DAY ? "NBA Games · November 1" : "NBA Daily is being finalized"}</h2>
            <span>{day < NBA_GAMES_LAUNCH_DAY
              ? "Nine games · every other day through the regular season"
              : "Official scoring and result verification required before launch"}</span>
          </div>
        </div>
        <p className="play-v2__muted">NBA Futures and the championship remain available separately.</p>
      </>}
      </>}
    </section>

    <section className="play-v2__performance" aria-label="Your Play Performance">
      <div className="play-v2__section-top">
        <span>YOUR PLAY PERFORMANCE</span>
        <span className="nba-games-hub__pending-label">OFFICIAL SCORES ONLY</span>
      </div>
      <div className="play-v2__metrics">
        <div><span>DAILY AVERAGE</span><strong>{published && average !== null ? average : "—"}</strong><small>/100</small></div>
        <div><span>COMPLETED</span><strong>{published ? completed : "—"}</strong><small>official games</small></div>
        <div><span>PERSONAL BEST</span><strong>{published && best !== null ? best : "—"}</strong><small>/100</small></div>
      </div>
      {!published ? <p className="play-v2__muted">Your NBA scores will appear here after official Daily results are enabled. Private previews do not count.</p> : null}
    </section>

    {profile ? <MatchupsCompact sport="nba" /> : (
      <section className="play-v2__matchups" aria-label="Your Matchups">
        <div className="play-v2__section-top"><span>YOUR MATCHUPS</span></div>
        <p className="play-v2__muted">{status === "loading" ? "Loading your HQ profile…" : "Sign in to see your matchups."}</p>
      </section>
    )}

    <section className="play-v2__room" aria-label="Game Room">
      <div className="play-v2__room-heading">
        <div><span>ALL GAMES</span><h2>Game Room</h2></div>
        <span>4 GAMES</span>
      </div>
      <div className="play-v2__room-grid">
        {NBA_CASUAL_GAME_TYPES.map(game => {
          const meta = NBA_CASUAL_GAME_META[game];
          return <button key={game} type="button" className="play-v2__game"
            disabled={!owner && !published} onClick={() => navigate(NBA_GAME_ROUTES[game])}>
            <span className="play-v2__game-mark" aria-hidden="true">{meta.icon}</span>
            <strong>{NBA_DAILY_GAME_LABELS[game]}</strong>
            <small>{meta.description}</small>
            <span className="play-v2__game-arrow" aria-hidden="true">↗</span>
          </button>;
        })}
      </div>
    </section>

    {owner ? <section className="nba-games-hub__owner-tools" aria-label="Owner preview catalog">
      <button type="button" className="nba-games-hub__owner-toggle"
        onClick={() => setShowOwnerCatalog(open => !open)} aria-expanded={showOwnerCatalog}>
        Daily Test Catalog <span>{showOwnerCatalog ? "HIDE" : "SHOW ALL NINE"} ↗</span>
      </button>
      {showOwnerCatalog ? <div className="nba-games-hub__catalog">
        {dailyGameOrder.map(game => (
          <Link key={game} to={previewRoute(game)}>
            <span>{NBA_DAILY_GAME_LABELS[game]}</span>
            <small>{NBA_DAILY_WEIGHTS[game]}× WEIGHT · PREVIEW ↗</small>
          </Link>
        ))}
      </div> : null}
    </section> : null}
  </div>;
}
