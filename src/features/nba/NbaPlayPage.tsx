import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { canPreviewNbaWhoAmI } from "./NbaWhoAmIOwnerGate";
import {
  NBA_CASUAL_GAME_TYPES, NBA_DAILY_GAME_LABELS, NBA_GAMES_LAUNCH_DAY,
  NBA_DAILY_WEIGHTS, nbaCanAccessReleasedGames, nbaCentralDay,
  nbaOwnerPreviewDaily, nbaRegularSeasonDaily, type NbaDailyGame,
} from "./nbaDailySchedule";
import "../../styles/nba-hq.css";
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

function previewRoute(game: NbaDailyGame) {
  // Those two games still have only Casual previews. Do not mislabel them as saved Daily runs.
  return NBA_GAME_ROUTES[game] + (game === "who_am_i" || game === "hit_the_number" ? "" : "?mode=daily");
}

const dailyGameOrder: readonly NbaDailyGame[] = [
  "average_fan", "sports_feud", "millionaire", "who_am_i", "find_leader",
  "wavelength", "bar_trivia", "hit_the_number", "higher_lower",
];

export default function NbaPlayPage() {
  const { profile } = useIdentity();
  const day = nbaCentralDay();
  const owner = canPreviewNbaWhoAmI(profile);
  const published = nbaCanAccessReleasedGames(day);
  const slot = nbaRegularSeasonDaily(day);
  const ownerPreview = nbaOwnerPreviewDaily(day);
  const featured = published ? slot?.gameType : owner ? ownerPreview ?? slot?.gameType : null;
  const featuredRoute = featured ? previewRoute(featured) : null;

  return <div className="page nba-hq-page nba-games-hub" data-sport="nba">
    <header className="nba-hq-hero">
      <p className="eyebrow">BASKETBALL HQ</p>
      <h1>Basketball Games</h1>
      <p>Nine games. One featured NBA challenge every other day during the regular season.</p>
    </header>

    <section className="surface-card nba-games-hub__featured" aria-label="NBA featured challenge">
      <div className="nba-games-hub__topline">
        <span>{published ? "NBA DAILY" : owner ? "OWNER TESTING · NOT RANKED" : "NBA GAMES"}</span>
        <span>{published && slot ? (slot.isPublicationDay ? "NEW CHALLENGE" : "DAY 2 OF 2") : "NOVEMBER 1 LAUNCH"}</span>
      </div>
      {featured && owner && !published ? <>
        <p className="nba-games-hub__eyebrow">TODAY'S PRIVATE GAME PREVIEW</p>
        <h2>{NBA_DAILY_GAME_LABELS[featured]}</h2>
        <p>This is the selected NBA game for today's private rehearsal. Scores aren't saved to the official Daily leaderboard yet.</p>
        <Link className="primary-action" to={featuredRoute!}>TEST THIS GAME →</Link>
      </> : published && featured ? <>
        <p className="nba-games-hub__eyebrow">FEATURED THROUGH {slot?.nextDay}</p>
        <h2>{NBA_DAILY_GAME_LABELS[featured]}</h2>
        <p>Complete the featured challenge before the next NBA Daily arrives.</p>
        <Link className="primary-action" to={NBA_GAME_ROUTES[featured]}>PLAY DAILY →</Link>
      </> : <>
        <p className="nba-games-hub__eyebrow">2026–27 SEASON</p>
        <h2>{day < NBA_GAMES_LAUNCH_DAY ? "NBA Games start November 1" : "NBA Games are being finalized"}</h2>
        <p>{day < NBA_GAMES_LAUNCH_DAY
          ? "Nine Daily games and four anytime Casual games are coming. NBA Futures are already available."
          : "The new Daily experience will open after official scoring and result verification."}</p>
      </>}
    </section>

    <section className="surface-card nba-games-hub__section" aria-label="NBA Casual games">
      <div className="nba-games-hub__section-heading"><h2>Game Room</h2><small>4 CASUAL GAMES</small></div>
      <p>Replay these anytime without affecting the official NBA Daily result.</p>
      <div className="nba-games-hub__grid">
        {NBA_CASUAL_GAME_TYPES.map(game => published || owner ? (
          <Link className="nba-games-hub__tile" key={game} to={NBA_GAME_ROUTES[game]}>
            <strong>{NBA_DAILY_GAME_LABELS[game]}</strong>
            <span>{published ? "PLAY CASUAL →" : "OWNER PREVIEW →"}</span>
          </Link>
        ) : (
          <div className="nba-games-hub__tile is-locked" key={game}>
            <strong>{NBA_DAILY_GAME_LABELS[game]}</strong><span>AVAILABLE AT LAUNCH</span>
          </div>
        ))}
      </div>
    </section>

    {owner ? <section className="surface-card nba-games-hub__section" aria-label="Owner preview catalog">
      <div className="nba-games-hub__section-heading"><h2>Daily Test Catalog</h2><small>OWNER ONLY</small></div>
      <p>Test each game independently while server-owned NBA Daily results and drill-downs are being integrated.</p>
      <div className="nba-games-hub__catalog">
        {dailyGameOrder.map(game => (
          <Link key={game} to={previewRoute(game)}>
            <span>{NBA_DAILY_GAME_LABELS[game]}</span>
            <small>{NBA_DAILY_WEIGHTS[game]}× WEIGHT · PREVIEW ↗</small>
          </Link>
        ))}
      </div>
    </section> : null}

    <section className="surface-card nba-games-hub__footer" aria-label="NBA Futures">
      <div><small>2026–27 NBA SEASON</small><strong>NBA Futures & Championship</strong></div>
      <Link className="secondary-action" to="/nba/picks">OPEN FUTURES →</Link>
    </section>
  </div>;
}
