import { useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { playGames, type PlayGameId } from "./playRegistry";
import TodayChallengeHub from "./TodayChallengeHub";

const LIVE_GAME_ROUTES: Partial<Record<PlayGameId, string>> = {
  "find-leader": "/play/find-leader?mode=replayable",
  wavelength: "/play/wavelength",
  "blind-resume": "/play/blind-resume",
  "blind-rank": "/play/blind-rank",
  "keep-cut": "/play/keep-cut",
  "better-than": "/play/better-than",
  auction: "/play/auction",
};

export default function TodayChallengeHubPage() {
  const navigate = useNavigate();

  return (
    <div className="page play-page today-challenge-hub-page">
      <section className="page-heading">
        <p className="eyebrow">GAMES &amp; CHALLENGES</p>
        <h1>Play</h1>
        <p>Daily challenges, blind debates, and UFC rankings built to argue about.</p>
      </section>

      <TodayChallengeHub />
      <ChallengeCenter />

      <section className="play-games">
        <header>
          <p className="eyebrow">ALL GAMES</p>
          <h2>Pick your debate</h2>
          <p>Quick games, blind tests, and rankings built to argue about.</p>
        </header>
        <div className="play-games__grid">
          {playGames.map((game) => {
            const route = LIVE_GAME_ROUTES[game.id];
            return route ? (
              <button
                className="play-game-card"
                type="button"
                key={game.id}
                onClick={() => navigate(route)}
              >
                <span className="play-game-card__icon">{game.icon}</span>
                <span className={`play-game-card__status${game.availability === "preview" ? " is-preview" : ""}`}>
                  {game.availability === "preview" ? "PREVIEW" : "PLAY NOW"}
                </span>
                <strong>{game.title}</strong>
                <small>{game.description}</small>
                <em>OPEN GAME →</em>
              </button>
            ) : (
              <article className="play-game-card" key={game.id}>
                <span className="play-game-card__icon">{game.icon}</span>
                <strong>{game.title}</strong>
                <small>{game.description}</small>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
